import { Office365UsersService } from "@/generated"
import type { User } from "@/generated/models/Office365UsersModel"
import { createDataLoadError, type DataLoadError, logDiagnostic } from "@/lib/load-errors"

export type RequesterEmailLookupResult = {
  email: string | null
  error?: DataLoadError
}

const officeSearchLimit = 10
const notAvailableEmail = "N/A"

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

function getUserEmail(user: User): string {
  if (typeof user.Mail === "string" && user.Mail.trim() !== "") {
    return user.Mail.trim()
  }

  if (typeof user.UserPrincipalName === "string" && user.UserPrincipalName.trim() !== "") {
    return user.UserPrincipalName.trim()
  }

  return ""
}

function getUserDisplayName(user: User): string {
  if (typeof user.DisplayName === "string" && user.DisplayName.trim() !== "") {
    return user.DisplayName.trim()
  }

  const fullName = [user.GivenName, user.Surname]
    .filter((value): value is string => typeof value === "string" && value.trim() !== "")
    .join(" ")
    .trim()

  return fullName
}

function scoreUserMatch(user: User, requesterName: string): number {
  const normalizedRequesterName = normalize(requesterName)
  const normalizedDisplayName = normalize(getUserDisplayName(user))
  const normalizedEmail = normalize(getUserEmail(user))
  const exactNameMatch = normalizedDisplayName === normalizedRequesterName
  const partialNameMatch =
    normalizedDisplayName.includes(normalizedRequesterName) ||
    normalizedRequesterName.includes(normalizedDisplayName)
  let score = 0

  if (exactNameMatch) {
    score += 100
  } else if (partialNameMatch) {
    score += 50
  }

  if (normalizedEmail.endsWith("@spaar.ca")) {
    score += 10
  }

  if (normalizedEmail !== "") {
    score += 5
  }

  return score
}

function getBestUserMatch(users: User[], requesterName: string): User | null {
  const rankedUsers = [...users].sort((left, right) => {
    return scoreUserMatch(right, requesterName) - scoreUserMatch(left, requesterName)
  })

  const bestUser = rankedUsers[0]

  if (!bestUser) {
    return null
  }

  return scoreUserMatch(bestUser, requesterName) > 0 ? bestUser : null
}

function getRequesterEmailError(error: unknown, requesterName: string): DataLoadError {
  void error
  void requesterName
  return createDataLoadError("Email unavailable.")
}

export async function lookupRequesterEmail(
  requesterName: string
): Promise<RequesterEmailLookupResult> {
  try {
    const result = await Office365UsersService.SearchUserV2(
      requesterName,
      officeSearchLimit,
      true
    )

    if (!result.success) {
      throw result.error ?? new Error("The technician email lookup could not be completed.")
    }

    const users = result.data.value ?? []
    const bestUser = getBestUserMatch(users, requesterName)

    if (!bestUser) {
      return {
        email: notAvailableEmail,
      }
    }

    const email = getUserEmail(bestUser)

    if (!email) {
      return {
        email: notAvailableEmail,
      }
    }

    return {
      email,
    }
  } catch (error) {
    logDiagnostic("requester-email.lookup", { requesterName, error })

    return {
      email: null,
      error: getRequesterEmailError(error, requesterName),
    }
  }
}
