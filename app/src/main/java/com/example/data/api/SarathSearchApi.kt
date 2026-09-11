package com.example.data.api

import com.example.data.model.AiOverviewResponse
import com.example.data.model.SearchResponse
import com.example.data.model.SuggestResponse
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

interface SarathSearchApi {
    @GET("functions/v1/search")
    suspend fun search(
        @Query("q") query: String,
        @Query("region") region: String? = null
    ): SearchResponse

    @GET("functions/v1/ai-overview")
    suspend fun getAiOverview(
        @Query("q") query: String
    ): AiOverviewResponse

    @GET("functions/v1/suggest")
    suspend fun getSuggestions(
        @Query("q") query: String
    ): SuggestResponse

    companion object {
        private const val BASE_URL = "https://ahnqtidjqriurlzzevkb.supabase.co/"

        fun create(): SarathSearchApi {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }

            val client = OkHttpClient.Builder()
                .connectTimeout(12, TimeUnit.SECONDS)
                .readTimeout(12, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            val moshi = Moshi.Builder()
                .addLast(KotlinJsonAdapterFactory())
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(MoshiConverterFactory.create(moshi))
                .build()
                .create(SarathSearchApi::class.java)
        }
    }
}
