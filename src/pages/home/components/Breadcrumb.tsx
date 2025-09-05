import React from 'react'
import { useMatches } from "react-router-dom";
import { Link } from "react-router-dom";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";

const Breadcrumb = () => {
  const matches = useMatches();
	console.log(matches)
  return (
    <Breadcrumbs size="lg">
      {matches
        .filter((m) => m.handle?.breadcrumb)
        .map((m, i, arr) => {
          const isLast = i === arr.length - 1;
          const label =
            typeof m.handle.breadcrumb === "function"
              ? m.handle.breadcrumb(m) // pass match to function
              : m.handle.breadcrumb;

          return (
            <BreadcrumbItem
              key={m.pathname}
              // as={isLast ? "span" : Link}
              
              isCurrent={isLast}
            >
              <Link to={isLast ? undefined : m.pathname}>{label}</Link>
            </BreadcrumbItem>
          );
        })}
    </Breadcrumbs>
  )
}

export default Breadcrumb