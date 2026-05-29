# SEO Slug Rules

All university slugs must:
- use English only
- use lowercase
- use kebab-case
- avoid Thai characters
- remain stable for SEO

Examples:

จุฬาลงกรณ์มหาวิทยาลัย
→ chulalongkorn-university

มหาวิทยาลัยธรรมศาสตร์
→ thammasat-university

มหาวิทยาลัยมหิดล
→ mahidol-university

มหาวิทยาลัยเกษตรศาสตร์
→ kasetsart-university

---

# Migration Tasks

Update all existing university slugs to SEO-friendly English slugs.

Requirements:
- preserve uniqueness
- avoid duplicate slugs
- generate deterministic slugs
- support future SEO pages

---

# Important Rules

Never:
- generate random suffixes
- use Thai characters in slugs
- use database IDs in URLs

Always:
- use readable English names
- keep URLs human-friendly
- keep slugs stable permanently