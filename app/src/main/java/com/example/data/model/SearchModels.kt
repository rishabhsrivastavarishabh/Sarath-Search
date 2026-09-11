package com.example.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SearchResponse(
    @Json(name = "query") val query: String? = null,
    @Json(name = "count") val count: Int? = 0,
    @Json(name = "provider") val provider: String? = null,
    @Json(name = "results") val results: List<SearchResultItem>? = emptyList(),
    @Json(name = "debug") val debug: String? = null
)

@JsonClass(generateAdapter = true)
data class SearchResultItem(
    @Json(name = "title") val title: String = "",
    @Json(name = "url") val url: String = "",
    @Json(name = "domain") val domain: String? = null,
    @Json(name = "snippet") val snippet: String? = null,
    @Json(name = "lang") val lang: String? = "EN",
    @Json(name = "source") val source: String? = null
)

@JsonClass(generateAdapter = true)
data class AiOverviewResponse(
    @Json(name = "shown") val shown: Boolean = false,
    @Json(name = "reason") val reason: String? = null,
    @Json(name = "answer") val answer: String? = null,
    @Json(name = "confidence") val confidence: Double? = null,
    @Json(name = "citations") val citations: List<AiCitation>? = emptyList()
)

@JsonClass(generateAdapter = true)
data class AiCitation(
    @Json(name = "n") val n: Int = 1,
    @Json(name = "url") val url: String = "",
    @Json(name = "domain") val domain: String? = null,
    @Json(name = "lang") val lang: String? = "EN"
)

data class BangShortcut(
    val trigger: String,
    val name: String,
    val category: String,
    val urlTemplate: String
)

@JsonClass(generateAdapter = true)
data class ImageResultItem(
    @Json(name = "title") val title: String,
    @Json(name = "imageUrl") val imageUrl: String,
    @Json(name = "sourceUrl") val sourceUrl: String,
    @Json(name = "domain") val domain: String? = null,
    @Json(name = "source") val source: String? = null,
    @Json(name = "dimensions") val dimensions: String? = null
)

@JsonClass(generateAdapter = true)
data class NewsResultItem(
    @Json(name = "title") val title: String,
    @Json(name = "snippet") val snippet: String,
    @Json(name = "url") val url: String,
    @Json(name = "domain") val domain: String? = null,
    @Json(name = "source") val source: String? = null,
    @Json(name = "publishedTime") val publishedTime: String? = null,
    @Json(name = "lang") val lang: String? = "EN"
)

@JsonClass(generateAdapter = true)
data class SuggestResponse(
    @Json(name = "query") val query: String? = null,
    @Json(name = "suggestions") val suggestions: List<String>? = emptyList()
)

val DEFAULT_BANGS = listOf(
    BangShortcut("!yt", "YouTube", "Media", "https://www.youtube.com/results?search_query="),
    BangShortcut("!gh", "GitHub", "Dev", "https://github.com/search?q="),
    BangShortcut("!maps", "Google Maps", "Transit", "https://www.google.com/maps/search/"),
    BangShortcut("!w", "Wikipedia", "Reference", "https://en.wikipedia.org/wiki/Special:Search?search="),
    BangShortcut("!whi", "Wikipedia Hindi", "Reference", "https://hi.wikipedia.org/wiki/Special:Search?search="),
    BangShortcut("!r", "Reddit", "Community", "https://www.reddit.com/search/?q="),
    BangShortcut("!x", "X / Twitter", "Social", "https://x.com/search?q="),
    BangShortcut("!irctc", "IRCTC NextGen", "Transit", "https://www.irctc.co.in/nget/train-search"),
    BangShortcut("!pib", "PIB India", "Government", "https://pib.gov.in/allRel.aspx"),
    BangShortcut("!ddg", "DuckDuckGo", "Search", "https://duckduckgo.com/?q=")
)
