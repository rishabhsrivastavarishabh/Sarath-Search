package com.example.data.repository

import com.example.data.local.SearchHistoryDao
import com.example.data.local.SearchHistoryEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class SearchHistoryRepository(
    private val dao: SearchHistoryDao
) {
    val recentSearches: Flow<List<String>> = dao.getRecentSearches().map { list ->
        list.map { it.query }
    }

    suspend fun recordSearch(rawQuery: String) {
        val query = rawQuery.trim()
        if (query.isBlank()) return

        // Remove duplicates of the same query first to update timestamp
        dao.deleteByQuery(query)
        dao.insertSearch(SearchHistoryEntity(query = query, timestamp = System.currentTimeMillis()))
        // Ensure strictly max 5 queries
        dao.pruneOldSearches()
    }

    suspend fun removeSearch(query: String) {
        dao.deleteByQuery(query.trim())
    }

    suspend fun clearHistory() {
        dao.clearAll()
    }
}
