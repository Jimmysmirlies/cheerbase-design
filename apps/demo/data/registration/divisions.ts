import { divisionCatalog } from "../divisions";

export type RegistrationDivisionCategory = {
  id: string;
  label: string;
  divisions: string[];
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const divisionCategories: RegistrationDivisionCategory[] =
  divisionCatalog.map((category) => {
    const divisions = category.tiers.flatMap((tier) =>
      tier.levels.map((level) => `${tier.name} - ${level}`),
    );

    return {
      id: slugify(category.name),
      label: category.name,
      divisions,
    };
  });

export const allDivisions = divisionCategories.flatMap((category) =>
  category.divisions.map((division) => `${category.label} - ${division}`),
);
