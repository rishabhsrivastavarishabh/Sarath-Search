package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.model.AiOverviewResponse
import com.example.data.model.DEFAULT_BANGS
import com.example.data.model.ImageResultItem
import com.example.data.model.NewsResultItem
import com.example.data.model.SearchResponse
import com.example.data.model.SearchResultItem
import com.example.data.repository.SarathSearchRepository
import com.example.data.repository.SearchHistoryRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.system.measureTimeMillis

enum class LanguageFilter {
    ALL, EN, HI
}

enum class SearchTab {
    ALL, IMAGES, NEWS
}

data class BangMatch(
    val trigger: String,
    val targetName: String,
    val redirectUrl: String,
    val remainingQuery: String
)

data class SearchUiState(
    val query: String = "",
    val activeQuery: String = "",
    val isSearching: Boolean = false,
    val isAiLoading: Boolean = false,
    val isImagesLoading: Boolean = false,
    val isNewsLoading: Boolean = false,
    val searchResponse: SearchResponse? = null,
    val aiOverviewResponse: AiOverviewResponse? = null,
    val imageResults: List<ImageResultItem> = emptyList(),
    val newsResults: List<NewsResultItem> = emptyList(),
    val recentSearches: List<String> = emptyList(),
    val suggestions: List<String> = emptyList(),
    val isSuggesting: Boolean = false,
    val activeInAppUrl: String? = null,
    val selectedLanguageFilter: LanguageFilter = LanguageFilter.ALL,
    val selectedTab: SearchTab = SearchTab.ALL,
    val sessionDarkMode: Boolean? = null, // null follows system, true/false session override
    val showDebugView: Boolean = false,
    val searchDurationMs: Long? = null,
    val hasSearched: Boolean = false,
    val errorMessage: String? = null,
    val safeSearch: Boolean = true,
    val regionBias: String = "in", // "in" or "global"
    val bangDetected: BangMatch? = null,
    val feedbackGiven: Set<String> = emptySet()
) {
    val filteredResults: List<SearchResultItem>
        get() {
            val list = searchResponse?.results ?: emptyList()
            return when (selectedLanguageFilter) {
                LanguageFilter.ALL -> list
                LanguageFilter.EN -> list.filter { it.lang?.equals("EN", ignoreCase = true) == true }
                LanguageFilter.HI -> list.filter { it.lang?.equals("HI", ignoreCase = true) == true }
            }
        }

    val filteredNewsResults: List<NewsResultItem>
        get() {
            return when (selectedLanguageFilter) {
                LanguageFilter.ALL -> newsResults
                LanguageFilter.EN -> newsResults.filter { it.lang?.equals("EN", ignoreCase = true) == true }
                LanguageFilter.HI -> newsResults.filter { it.lang?.equals("HI", ignoreCase = true) == true }
            }
        }
}

class SearchViewModel @JvmOverloads constructor(
    application: Application,
    private val repository: SarathSearchRepository = SarathSearchRepository(),
    private val historyRepository: SearchHistoryRepository = SearchHistoryRepository(
        AppDatabase.getInstance(application).searchHistoryDao()
    )
) : AndroidViewModel(application) {

    companion object {
        fun provideFactory(application: Application): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return SearchViewModel(application) as T
                }
            }
    }

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    private var suggestionJob: Job? = null

    init {
        // Observe Room local search history reactively
        viewModelScope.launch {
            historyRepository.recentSearches.collect { recents ->
                _uiState.update { it.copy(recentSearches = recents) }
            }
        }
    }

    fun onQueryChange(newQuery: String) {
        val bang = checkBang(newQuery)
        _uiState.update { it.copy(query = newQuery, bangDetected = bang) }

        // Asynchronous query suggestions with debounce
        suggestionJob?.cancel()
        val trimmed = newQuery.trim()
        if (trimmed.isEmpty()) {
            _uiState.update { it.copy(suggestions = emptyList(), isSuggesting = false) }
            return
        }

        suggestionJob = viewModelScope.launch {
            delay(180)
            _uiState.update { it.copy(isSuggesting = true) }
            val fetchedSuggestions = repository.fetchSuggestions(trimmed)
            _uiState.update {
                it.copy(
                    suggestions = fetchedSuggestions,
                    isSuggesting = false
                )
            }
        }
    }

    fun selectSuggestion(suggestedQuery: String) {
        // Clean bang triggers if present in parentheses e.g. "!yt (YouTube)"
        val cleanQuery = if (suggestedQuery.startsWith("!") && suggestedQuery.contains("(")) {
            suggestedQuery.substringBefore("(").trim() + " "
        } else {
            suggestedQuery
        }
        onQueryChange(cleanQuery)
        if (!cleanQuery.endsWith(" ")) {
            executeSearch(cleanQuery)
        }
    }

    private fun checkBang(q: String): BangMatch? {
        val trimmed = q.trim()
        if (!trimmed.startsWith("!")) return null
        val parts = trimmed.split("\\s+".toRegex(), limit = 2)
        val trigger = parts.firstOrNull() ?: return null
        val bang = DEFAULT_BANGS.firstOrNull { it.trigger.equals(trigger, ignoreCase = true) }
        return if (bang != null) {
            val remaining = if (parts.size > 1) parts[1] else ""
            val fullUrl = if (remaining.isNotEmpty()) bang.urlTemplate + java.net.URLEncoder.encode(remaining, "UTF-8") else bang.urlTemplate
            BangMatch(
                trigger = bang.trigger,
                targetName = bang.name,
                redirectUrl = fullUrl,
                remainingQuery = remaining
            )
        } else {
            null
        }
    }

    fun executeSearch(customQuery: String? = null) {
        val targetQuery = (customQuery ?: _uiState.value.query).trim()
        if (targetQuery.isEmpty()) return

        // Persist to local Room database (last 5 queries, private)
        viewModelScope.launch {
            historyRepository.recordSearch(targetQuery)
        }

        val bang = checkBang(targetQuery)
        if (bang != null && bang.remainingQuery.isNotEmpty()) {
            _uiState.update { it.copy(bangDetected = bang) }
        }

        _uiState.update {
            it.copy(
                query = targetQuery,
                activeQuery = targetQuery,
                isSearching = true,
                isAiLoading = true,
                isImagesLoading = true,
                isNewsLoading = true,
                hasSearched = true,
                errorMessage = null,
                suggestions = emptyList(),
                selectedTab = SearchTab.ALL
            )
        }

        // Parallel fetch of /search, /ai-overview, image results, and news results
        viewModelScope.launch {
            val duration = measureTimeMillis {
                val searchRes = repository.fetchSearch(targetQuery, _uiState.value.regionBias)
                _uiState.update {
                    it.copy(
                        isSearching = false,
                        searchResponse = searchRes
                    )
                }
            }
            _uiState.update { it.copy(searchDurationMs = duration) }
        }

        viewModelScope.launch {
            val aiRes = repository.fetchAiOverview(targetQuery)
            _uiState.update {
                it.copy(
                    isAiLoading = false,
                    aiOverviewResponse = aiRes
                )
            }
        }

        viewModelScope.launch {
            val images = repository.fetchImageResults(targetQuery)
            _uiState.update {
                it.copy(
                    isImagesLoading = false,
                    imageResults = images
                )
            }
        }

        viewModelScope.launch {
            val news = repository.fetchNewsResults(targetQuery)
            _uiState.update {
                it.copy(
                    isNewsLoading = false,
                    newsResults = news
                )
            }
        }
    }

    fun deleteHistoryItem(query: String) {
        viewModelScope.launch {
            historyRepository.removeSearch(query)
        }
    }

    fun clearSearchHistory() {
        viewModelScope.launch {
            historyRepository.clearHistory()
        }
    }

    fun openInAppUrl(url: String) {
        _uiState.update { it.copy(activeInAppUrl = url) }
    }

    fun closeInAppUrl() {
        _uiState.update { it.copy(activeInAppUrl = null) }
    }

    fun setLanguageFilter(filter: LanguageFilter) {
        _uiState.update { it.copy(selectedLanguageFilter = filter) }
    }

    fun setSelectedTab(tab: SearchTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun toggleDarkMode(currentEffectiveDark: Boolean) {
        _uiState.update { it.copy(sessionDarkMode = !currentEffectiveDark) }
    }

    fun toggleDebugView() {
        _uiState.update { it.copy(showDebugView = !it.showDebugView) }
    }

    fun setSafeSearch(enabled: Boolean) {
        _uiState.update { it.copy(safeSearch = enabled) }
    }

    fun setRegionBias(bias: String) {
        _uiState.update { it.copy(regionBias = bias) }
    }

    fun clearSearch() {
        _uiState.update {
            it.copy(
                query = "",
                activeQuery = "",
                hasSearched = false,
                searchResponse = null,
                aiOverviewResponse = null,
                bangDetected = null,
                isSearching = false,
                isAiLoading = false,
                suggestions = emptyList()
            )
        }
    }

    fun recordFeedback(url: String, isThumbsUp: Boolean) {
        _uiState.update {
            it.copy(feedbackGiven = it.feedbackGiven + url)
        }
    }

    fun dismissBang() {
        _uiState.update { it.copy(bangDetected = null) }
    }
}

