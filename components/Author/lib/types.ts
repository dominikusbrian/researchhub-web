import {
  AuthorInstitution,
  parseInstitution,
} from "~/components/Institution/lib/types";
import {
  AuthorProfile,
  ID,
  parseAuthorProfile,
} from "~/config/types/root_types";

export type Achievement = "CITED_AUTHOR" | "OPEN_ACCESS";

export type FullAuthorProfile = {
  id: ID;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  profileImage?: string;
  headline?: string;
  description?: string;
  openAlexIds: Array<string>;
  institutions: Array<AuthorInstitution>;
  coauthors: Array<AuthorProfile>;
  activityByYear: Array<{
    year: number;
    worksCount: number;
    citationCount: number;
  }>;
  achievements: Array<Achievement>;
  openAccessPct: number;
  hIndex: number;
  i10Index: number;
  createdDate: string;
  orcidUrl?: string;
  xUrl?: string;
  linkedInUrl?: string;
  googleScholarUrl?: string;
  summaryStats: {
    worksCount: number;
    citationCount: number;
    twoYearMeanCitedness: number;
  };
};

export const parseFullAuthorProfile = (raw: any): FullAuthorProfile => {
  const parsed = {
    id: raw.id,
    profileImage: raw.profile_image,
    firstName: raw.first_name,
    lastName: raw.last_name,
    url: `/user/${raw.id}/overview`,
    description: raw.description,
    isVerified: raw.is_verified,
    headline: raw?.headline || "",
    isHubEditor: raw.is_hub_editor,
    openAlexIds: raw.openalex_ids || [],
    achievements: raw.achievements || [],
    openAccessPct: raw.open_access_pct,
    hIndex: raw.h_index,
    i10Index: raw.i10_index,
    createdDate: raw.created_date,
    coauthors: raw.coauthors.map((coauthor) => parseAuthorProfile(coauthor)),
    summaryStats: {
      worksCount: raw.summary_stats.works_count,
      citationCount: raw.summary_stats.citation_count,
      twoYearMeanCitedness: raw.summary_stats.two_year_mean_citedness,
    },
    activityByYear: raw.activity_by_year.map((activity) => ({
      year: activity.year,
      worksCount: activity.works_count,
      citationCount: activity.citation_count,
    })),
    institutions: raw.institutions.map((inst) => {
      return {
        id: inst.id,
        institution: parseInstitution(inst.institution),
        years: inst.years,
      };
    }),
  };

  return parsed;
};
