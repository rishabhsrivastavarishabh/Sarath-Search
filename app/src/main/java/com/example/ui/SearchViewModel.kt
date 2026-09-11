package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.model.AiOverviewResponse
import com.example.data.model.DEFAULT_BANGS
import com.example.data.model.SearchResponse
import com.example.data.model.SearchResultItem
import com.example.data.repository.SarathSearchRepository
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
    val searchResponse: SearchResponse? = null,
    val aiOverviewResponse: AiOverviewResponse? = null,
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
}

class SearchViewModel(
    private val repository: SarathSearchRepository = SarathSearchRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(SearchUiState())
    val uiState: StateFlow<SearchUiState> = _uiState.asStateFlow()

    fun onQueryChange(newQuery: String) {
        val bang = checkBang(newQuery)
        _uiState.update { it.copy(query = newQuery, bangDetected = bang) }
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
                hasSearched = true,
                errorMessage = null,
                selectedTab = SearchTab.ALL
            )
        }

        // Parallel fetch of /search and /ai-overview (Organic results NEVER wait for AI card)
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
                isAiLoading = false
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
