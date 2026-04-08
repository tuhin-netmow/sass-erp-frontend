/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/store/baseApi";
import type {
  HelpArticle,
  FAQ,
  HelpVideo,
  SupportTicket,
  TicketMessage,
  TicketStats,
  HelpResponse,
  HelpQueryParams,
  TicketQueryParams
} from "@/shared/types/app";

export const helpApiService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ARTICLES ====================
    getAllArticles: builder.query<HelpResponse<HelpArticle[]>, HelpQueryParams>({
      query: (params) => ({
        url: "/help/articles",
        method: "GET",
        params,
      }),
      providesTags: ["HelpArticles"],
    }),

    getArticleBySlug: builder.query<HelpResponse<HelpArticle>, string>({
      query: (slug) => ({
        url: `/help/articles/${slug}`,
        method: "GET",
      }),
      providesTags: ["HelpArticles"],
    }),

    markArticleHelpful: builder.mutation<
      HelpResponse<HelpArticle>,
      { slug: string; helpful: boolean }
    >({
      query: ({ slug, helpful }) => ({
        url: `/help/articles/${slug}`,
        method: "POST",
        body: { helpful },
      }),
      invalidatesTags: ["HelpArticles"],
    }),

    createArticle: builder.mutation<HelpResponse<HelpArticle>, Partial<HelpArticle>>({
      query: (body) => ({
        url: "/help/articles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["HelpArticles"],
    }),

    updateArticle: builder.mutation<
      HelpResponse<HelpArticle>,
      { id: string; body: Partial<HelpArticle> }
    >({
      query: ({ id, body }) => ({
        url: `/help/articles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["HelpArticles"],
    }),

    deleteArticle: builder.mutation<HelpResponse<HelpArticle>, string>({
      query: (id) => ({
        url: `/help/articles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["HelpArticles"],
    }),

    // ==================== FAQs ====================
    getAllFAQs: builder.query<HelpResponse<FAQ[]>, HelpQueryParams>({
      query: (params) => ({
        url: "/help/faqs",
        method: "GET",
        params,
      }),
      providesTags: ["FAQs"],
    }),

    // ==================== VIDEOS ====================
    getAllVideos: builder.query<HelpResponse<HelpVideo[]>, HelpQueryParams>({
      query: (params) => ({
        url: "/help/videos",
        method: "GET",
        params,
      }),
      providesTags: ["HelpVideos"],
    }),

    getVideoById: builder.query<HelpResponse<HelpVideo>, string>({
      query: (id) => ({
        url: `/help/videos/${id}`,
        method: "GET",
      }),
      providesTags: ["HelpVideos"],
    }),

    // ==================== SUPPORT TICKETS ====================
    getAllTickets: builder.query<HelpResponse<SupportTicket[]>, TicketQueryParams>({
      query: (params) => ({
        url: "/help/tickets",
        method: "GET",
        params,
      }),
      providesTags: ["SupportTickets"],
    }),

    getTicketById: builder.query<HelpResponse<SupportTicket>, string>({
      query: (id) => ({
        url: `/help/tickets/${id}`,
        method: "GET",
      }),
      providesTags: ["SupportTickets"],
    }),

    createTicket: builder.mutation<
      HelpResponse<SupportTicket>,
      Omit<SupportTicket, "_id" | "publicId" | "ticketNumber" | "createdBy" | "createdAt" | "updatedAt" | "companyId">
    >({
      query: (body) => ({
        url: "/help/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SupportTickets", "TicketStats"],
    }),

    updateTicket: builder.mutation<
      HelpResponse<SupportTicket>,
      { id: string; body: Partial<SupportTicket> }
    >({
      query: ({ id, body }) => ({
        url: `/help/tickets/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["SupportTickets", "TicketStats"],
    }),

    addTicketMessage: builder.mutation<
      HelpResponse<TicketMessage>,
      { ticketId: string; message: string; attachments?: string[]; isInternal?: boolean }
    >({
      query: (body) => ({
        url: `/help/tickets/${body.ticketId}/messages`,
        method: "POST",
        body: { message: body.message, attachments: body.attachments, isInternal: body.isInternal },
      }),
      invalidatesTags: ["SupportTickets", "TicketMessages"],
    }),

    rateTicket: builder.mutation<
      HelpResponse<SupportTicket>,
      { ticketId: string; rating: number; feedback?: string }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/help/tickets/${ticketId}/rate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SupportTickets", "TicketStats"],
    }),

    getTicketStats: builder.query<HelpResponse<TicketStats>, void>({
      query: () => ({
        url: "/help/tickets/stats",
        method: "GET",
      }),
      providesTags: ["TicketStats"],
    }),
  }),
});

export const {
  // Articles
  useGetAllArticlesQuery,
  useGetArticleBySlugQuery,
  useMarkArticleHelpfulMutation,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  // FAQs
  useGetAllFAQsQuery,
  // Videos
  useGetAllVideosQuery,
  useGetVideoByIdQuery,
  // Tickets
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddTicketMessageMutation,
  useRateTicketMutation,
  useGetTicketStatsQuery,
} = helpApiService;
