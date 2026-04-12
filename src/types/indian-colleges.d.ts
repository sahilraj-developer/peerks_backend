declare module "indian-colleges" {
  export function getAllColleges(): string[];
  export function getCollegesByState(state: string): Array<{ college: string; state: string; district: string; university?: string }>;
  export function getCollegesByDistrict(district: string): Array<{ college: string; state: string; district: string; university?: string }>;
  export function getCollegesByStateAndDistrict(
    state: string,
    district: string
  ): Array<{ college: string; state: string; district: string; university?: string }>;
  export function getAllUniversities(): string[];
  export function getAllCollegesAndUniversities(): string[];
}
