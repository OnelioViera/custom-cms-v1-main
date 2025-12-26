import { MetadataRoute } from 'next';

interface Page {
  slug: string;
  status: string;
  updatedAt: string | Date;
}

interface Project {
  slug: string;
  status: string;
  updatedAt: string | Date;
}

async function getPages(): Promise<Page[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pages`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.success ? data.pages : [];
  } catch {
    return [];
  }
}

async function getProjects(): Promise<Project[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects`, {
      cache: 'no-store',
    });
    const data = await response.json();
    return data.success ? data.projects : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://custom-cms-v1.vercel.app';

  const pages = await getPages();
  const projects = await getProjects();

  const pageUrls = pages
    .filter((page: Page) => page.status === 'published')
    .map((page: Page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const projectUrls = projects
    .filter((project: Project) => project.status === 'completed')
    .map((project: Project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...pageUrls,
    ...projectUrls,
  ];
}
