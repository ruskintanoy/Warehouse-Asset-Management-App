import { useEffect, useRef, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { User } from "@/generated/models/Office365UsersModel"
import { Office365UsersService } from "@/generated/services/Office365UsersService"

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong while calling Office 365 Users."
}

function DirectoryUserCard({ user }: { user: User }) {
  return (
    <Card className="h-full">
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold">{user.DisplayName ?? "No display name"}</p>
            <p className="text-sm text-muted-foreground">
              {user.Mail ?? user.UserPrincipalName ?? "No email or UPN"}
            </p>
          </div>
          <Badge variant={user.AccountEnabled === false ? "destructive" : "secondary"}>
            {user.AccountEnabled === false ? "Disabled" : "Active"}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Department</p>
            <p>{user.Department ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Job Title</p>
            <p>{user.JobTitle ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Office</p>
            <p>{user.OfficeLocation ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{user.mobilePhone ?? user.TelephoneNumber ?? "Not set"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isConnectionReady, setIsConnectionReady] = useState<boolean | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lastSearchTerm, setLastSearchTerm] = useState("")
  const searchRequestIdRef = useRef(0)

  async function handleConnectionCheck() {
    try {
      setIsProfileLoading(true)
      setProfileError(null)
      setIsConnectionReady(null)

      await Office365UsersService.TestConnection()
      const response = await Office365UsersService.MyProfile()

      setCurrentUser(response.data ?? null)
      setIsConnectionReady(true)
    } catch (error) {
      setCurrentUser(null)
      setIsConnectionReady(false)
      setProfileError(getErrorMessage(error))
    } finally {
      setIsProfileLoading(false)
    }
  }

  async function performSearch(rawSearchTerm: string) {
    const trimmedSearchTerm = rawSearchTerm.trim()
    const requestId = ++searchRequestIdRef.current

    try {
      setIsSearching(true)
      setSearchError(null)
      setLastSearchTerm(trimmedSearchTerm)

      const response = await Office365UsersService.SearchUserV2(trimmedSearchTerm, 12, true)
      const activeUsers = (response.data?.value ?? []).filter((user) => user.AccountEnabled !== false)

      if (requestId === searchRequestIdRef.current) {
        setResults(activeUsers)
      }
    } catch (error) {
      if (requestId === searchRequestIdRef.current) {
        setResults([])
        setSearchError(getErrorMessage(error))
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsSearching(false)
      }
    }
  }

  function handleClear() {
    searchRequestIdRef.current += 1
    setSearchTerm("")
    setLastSearchTerm("")
    setResults([])
    setSearchError(null)
    setIsSearching(false)
  }

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim()

    if (trimmedSearchTerm.length === 0) {
      searchRequestIdRef.current += 1
      setResults([])
      setLastSearchTerm("")
      setSearchError(null)
      setIsSearching(false)
      return
    }

    if (trimmedSearchTerm.length < 2) {
      searchRequestIdRef.current += 1
      setResults([])
      setLastSearchTerm("")
      setSearchError("Enter at least 2 characters before searching.")
      setIsSearching(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      void performSearch(trimmedSearchTerm)
    }, 350)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchTerm])

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary">Warehouse Asset Management App</Badge>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight">Office 365 user search test</h1>
              <p className="max-w-3xl text-muted-foreground">
                This page gives us a quick smoke test before we build the warehouse workflow. It verifies
                that your Office 365 Users connection can read your profile and search your company directory.
              </p>
            </div>
          </div>

          <ModeToggle />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connection check</CardTitle>
            <CardDescription>
              Use this first. It tests the Office 365 Users connection and then reads the current signed-in user.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" onClick={handleConnectionCheck} disabled={isProfileLoading}>
                {isProfileLoading ? "Checking connection..." : "Run connection check"}
              </Button>

              {isConnectionReady === true && (
                <Badge variant="secondary">Connection ready</Badge>
              )}

              {isConnectionReady === false && (
                <Badge variant="destructive">Connection failed</Badge>
              )}
            </div>

            {isProfileLoading && (
              <p className="text-sm text-muted-foreground">
                Waiting for Office 365 Users to respond. The first call can take a bit while auth initializes.
              </p>
            )}

            {profileError && (
              <p className="text-sm text-destructive">{profileError}</p>
            )}

            {!isProfileLoading && !profileError && currentUser && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Display Name</p>
                  <p className="font-medium">{currentUser.DisplayName ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{currentUser.Mail ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{currentUser.Department ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Job Title</p>
                  <p className="font-medium">{currentUser.JobTitle ?? "Not set"}</p>
                </div>
              </div>
            )}

            {!isProfileLoading && !profileError && !currentUser && isConnectionReady === null && (
              <p className="text-sm text-muted-foreground">
                No call has been made yet. Click the button to test the connector.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Search your company directory</CardTitle>
                <CardDescription>
                  Search by name, email, or user principal name. Results update as you type after a short pause, return up to 12 users, and hide disabled accounts.
                </CardDescription>
              </div>

              <Badge variant="outline">
                {results.length} result{results.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Try a name, email, or alias"
                className="sm:max-w-md"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={searchTerm.length === 0 && results.length === 0}
              >
                Clear
              </Button>
            </div>

            {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && !searchError && (
              <p className="text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
            )}

            {isSearching && (
              <p className="text-sm text-muted-foreground">
                Searching users through the Office 365 Users connector...
              </p>
            )}

            {searchError && (
              <p className="text-sm text-destructive">{searchError}</p>
            )}

            {!isSearching && !searchError && lastSearchTerm.length >= 2 && results.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active users matched "{lastSearchTerm}".
              </p>
            )}

            {results.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {results.map((user) => (
                  <DirectoryUserCard key={user.Id} user={user} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
