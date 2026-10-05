const fallbackByCategory = {
  Development: '/course-images/development.svg',
  Design: '/course-images/design.svg',
  Productivity: '/course-images/productivity.svg',
  Business: '/course-images/business.svg',
};

export function getCourseImage(course) {
  if (course?.thumbnail) return course.thumbnail;
  const category = course?.category || 'Development';
  return fallbackByCategory[category] || fallbackByCategory.Development;
}
