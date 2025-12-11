import axios from "axios";

export const apiAuthService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/auth`
})

export const apiUsersService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/users`
})

export const apiTestimonialsService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/testimonials`
})

export const apiCategoriesService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/categories`
})
export const apiTagsService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/tags`
})

// Public APIs
export const apiPublicTestimonialsService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/public/testimonials`
})

export const apiPublicEmbedsService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/public/embeds`
})

export const apiStatisticsService = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_URL_BASE}/public/stats`
})

