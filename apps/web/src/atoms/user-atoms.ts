import { HazelRpcClient } from "~/lib/services/common/rpc-atom-client"

/**
 * Mutation atom for updating user profile
 */
export const updateUserMutation = HazelRpcClient.mutation("user.update")

/**
 * Mutation atom for finalizing user onboarding
 */
export const finalizeOnboardingMutation = HazelRpcClient.mutation("user.finalizeOnboarding")
