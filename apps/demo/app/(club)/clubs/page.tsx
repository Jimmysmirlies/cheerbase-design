"use client";
/**
 * My Club Page
 *
 * Purpose
 * - Club Owner workspace to manage Teams, Registrations, and Club Settings.
 * - Layout inspired by Airbnb profile: left-side vertical nav, content on the right.
 *
 * Structure
 * - NavBar (clubs mode: no search, "Explore Events" link)
 * - Two-column layout:
 *   - Aside: vertical nav (Teams, Registrations, Club Settings)
 *   - Main: section content
 */
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TeamDetails from "@/components/features/clubs/TeamDetails";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@workspace/ui/shadcn/button";
import { Input } from "@workspace/ui/shadcn/input";
import { SearchIcon, UserPlusIcon } from "lucide-react";
import { CreateTeamModal, type CreateTeamData } from "@/components/features/clubs/CreateTeamModal";
import { TeamCard, type TeamData } from "@/components/features/clubs/TeamCard";
import type { RegistrationMember } from "@/components/features/registration/flow/types";
import UploadRosterDialog from "@/components/features/clubs/UploadRosterDialog";
import { FadeInSection } from "@/components/ui";
import { toast } from "@workspace/ui/shadcn/sonner";
import { useClubData } from "@/hooks/useClubData";
import { useUserTeams } from "@/hooks/useUserTeams";
import type { TeamRoster } from "@/types/club";

function ClubsPageInner() {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedTeamId = searchParams.get("teamId");
  const { data } = useClubData(user?.id);

  const selectedTeam = useMemo(
    () => data?.teams.find(team => team.id === selectedTeamId),
    [data?.teams, selectedTeamId]
  );
  const selectedRoster = useMemo(
    () => data?.rosters.find(roster => roster.teamId === selectedTeamId),
    [data?.rosters, selectedTeamId]
  );
  const { divisionLabel, levelLabel } = useMemo(() => {
    const parts = (selectedTeam?.division ?? "").split("-").map(p => p.trim()).filter(Boolean);
    if (!parts.length) return { divisionLabel: "—", levelLabel: "—" };
    if (parts.length === 1) return { divisionLabel: parts[0], levelLabel: "—" };
    const level = parts.pop() ?? "—";
    return { divisionLabel: parts.join(" - "), levelLabel: level };
  }, [selectedTeam?.division]);
  const memberCount = useMemo(() => {
    if (!selectedRoster) return 0;
    return (
      (selectedRoster.coaches?.length ?? 0) +
      (selectedRoster.athletes?.length ?? 0) +
      (selectedRoster.reservists?.length ?? 0) +
      (selectedRoster.chaperones?.length ?? 0)
    );
  }, [selectedRoster]);
  const breadcrumbItems = useMemo(
    () =>
      selectedTeam
        ? [
            { label: "Clubs", href: "/clubs" },
            { label: "Teams", href: "/clubs" },
            { label: selectedTeam.name },
          ]
        : [
            { label: "Clubs", href: "/clubs" },
            { label: "Teams" },
          ],
    [selectedTeam]
  );

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace("/");
      return;
    }
    if (user.role !== "club_owner") {
      router.replace(user.role === "organizer" ? "/organizer" : "/");
    }
  }, [user, status, router]);

  if (status === "loading") {
    return <main className="min-h-screen bg-background text-foreground" />;
  }

  if (!user || user.role !== "club_owner") {
    return null;
  }

  return (
    <section className="flex flex-1 flex-col">
      <PageHeader
        title={selectedTeam?.name ?? "Teams"}
        subtitle="Create teams and manage rosters for your club"
        hideSubtitle
        hideSubtitleDivider
        breadcrumbItems={breadcrumbItems}
        metadataItems={
          selectedTeam
            ? [
                { label: "Division", value: divisionLabel },
                { label: "Level", value: levelLabel },
                { label: "Members", value: memberCount },
              ]
            : undefined
        }
      />
      <div className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 lg:px-8">
        <FadeInSection className="w-full">
          {selectedTeamId ? (
            <TeamDetails
              teamId={selectedTeamId}
              onNavigateToTeams={() => {
                const params = new URLSearchParams(Array.from(searchParams.entries()));
                params.delete("teamId");
                router.replace(`${pathname}?${params.toString()}`);
              }}
            />
          ) : (
            <TeamsContent userId={user.id} />
          )}
        </FadeInSection>
      </div>
    </section>
  );
}

function TeamsContent({ userId }: { userId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, loading, error, refresh } = useClubData(userId);
  const { addTeam: addUserTeam } = useUserTeams(userId);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hydrate teams from data whenever data changes
  useEffect(() => {
    if (!data) return;
    const rosterMap = new Map<string, TeamRoster>(data.rosters.map(roster => [roster.teamId, roster]));
    const hydrated = data.teams.map(team => ({
      id: team.id,
      name: team.name,
      division: team.division,
      members: rosterToMembers(rosterMap.get(team.id)),
    }));
    setTeams(hydrated);
  }, [data]);

  const handleCreateTeam = (teamData: CreateTeamData) => {
    // Persist to localStorage for non-demo users
    const savedTeam = addUserTeam({
      name: teamData.name,
      division: teamData.division,
      size: 0,
      coedCount: 0,
    });

    if (savedTeam) {
      // Refresh to get updated data from localStorage
      refresh();
      toast.success(`${teamData.name} created successfully`);
    } else {
      // Fallback for demo users - just update local state
      const newTeam: TeamData = {
        ...teamData,
        members: [],
      };
      setTeams(prev => [...prev, newTeam]);
      toast.success(`${teamData.name} created successfully`);
    }
  };

  const sanitizedSearch = searchTerm.trim().toLowerCase();
  const filteredTeams = useMemo(
    () =>
      sanitizedSearch
        ? teams.filter(
            team =>
              team.name.toLowerCase().includes(sanitizedSearch) ||
              team.division.toLowerCase().includes(sanitizedSearch)
          )
        : teams,
    [sanitizedSearch, teams]
  );

  return (
    <section className="space-y-6">
      <FadeInSection className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search teams or divisions"
              className="w-full pl-9"
            />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="default"
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={loading}
            >
              <UserPlusIcon className="mr-2 size-4" />
              Create Team
            </Button>
            <UploadRosterDialog />
          </div>
        </div>
      </FadeInSection>

      {loading ? (
        <FadeInSection className="w-full" delay={80}>
          <div className="text-muted-foreground rounded-xl border border-dashed border-border/60 p-8 text-center">
            Loading teams...
          </div>
        </FadeInSection>
      ) : error ? (
        <FadeInSection className="w-full" delay={80}>
          <div className="text-destructive rounded-xl border border-dashed border-border/60 p-8 text-center">
            Failed to load teams.
          </div>
        </FadeInSection>
      ) : null}

      <FadeInSection className="w-full" delay={loading || error ? 160 : 120}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team, index) => (
              <FadeInSection key={team.id} delay={index * 80} className="h-full">
                <TeamCard
                  team={team}
                  onViewTeam={teamId => {
                    const params = new URLSearchParams(Array.from(searchParams.entries()));
                    params.set("teamId", teamId);
                    router.replace(`${pathname}?${params.toString()}`);
                  }}
                />
              </FadeInSection>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center sm:col-span-2 lg:col-span-3">
              <p className="text-muted-foreground body-small">
                {searchTerm
                  ? "No teams found matching your search"
                  : "No teams yet. Create your first team to get started."}
              </p>
            </div>
          )}
        </div>
      </FadeInSection>

      <CreateTeamModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSubmit={handleCreateTeam} />
    </section>
  );
}

function rosterToMembers(roster?: TeamRoster): RegistrationMember[] {
  if (!roster) return [];
  const toMember = (
    person: { firstName: string; lastName: string; dob?: string; email?: string; phone?: string },
    type: string
  ): RegistrationMember => ({
    name: `${person.firstName} ${person.lastName}`,
    type,
    dob: person.dob,
    email: person.email,
    phone: person.phone,
  });
  return [
    ...(roster.coaches ?? []).map(person => toMember(person, "Coach")),
    ...(roster.athletes ?? []).map(person => toMember(person, "Athlete")),
    ...(roster.reservists ?? []).map(person => toMember(person, "Reservist")),
    ...(roster.chaperones ?? []).map(person => toMember(person, "Chaperone")),
  ];
}

export default function ClubsPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <ClubsPageInner />
    </Suspense>
  );
}
