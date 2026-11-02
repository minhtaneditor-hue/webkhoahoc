// Course structure: chapters, each holding lessons. Lessons without a chapter
// (older courses, or a deleted chapter) are collected in a trailing group.

export type Chapter = { id: string; title: string; order_index: number };
export type ChapterGroup<L> = { chapter: Chapter | null; lessons: L[] };

type Orderable = { chapter_id?: string | null; order_index: number };

export function groupByChapter<L extends Orderable>(chapters: Chapter[], lessons: L[]): ChapterGroup<L>[] {
  const byOrder = (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index;
  const known = new Set(chapters.map((c) => c.id));
  const groups: ChapterGroup<L>[] = [...chapters].sort(byOrder).map((chapter) => ({
    chapter,
    lessons: lessons.filter((l) => l.chapter_id === chapter.id).sort(byOrder),
  }));
  const loose = lessons.filter((l) => !l.chapter_id || !known.has(l.chapter_id)).sort(byOrder);
  if (loose.length) groups.push({ chapter: null, lessons: loose });
  return groups;
}

/** Lessons in study order: chapter by chapter. */
export function lessonsInOrder<L extends Orderable>(chapters: Chapter[], lessons: L[]): L[] {
  return groupByChapter(chapters, lessons).flatMap((g) => g.lessons);
}
