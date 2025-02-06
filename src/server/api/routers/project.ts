import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const projectRouter = createTRPCRouter({
    createPrject : protectedProcedure.input().mutation(async({ctx, input})=> {
        ctx.user.userId
        console.log('hi')
        return true
    })
})