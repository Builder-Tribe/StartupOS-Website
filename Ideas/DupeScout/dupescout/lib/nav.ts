export const isActive = (href: string, pathname: string): boolean =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
