"use client";

import { useState } from "react";
import { liteClient } from "algoliasearch/lite";
import { useDocsSearch } from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
  type SharedProps,
} from "fumadocs-ui/components/dialog/search";

// Search-only credentials (safe to ship to the client); the index is synced
// post-build from fumadocs' static.json export by utils/update-index.ts.
//
// Composed from fumadocs' native dialog primitives instead of the shipped
// <AlgoliaSearchDialog> because 16.0.15 renders that component's footer as a
// sibling of the dialog content, leaking the tag chips onto the page while
// the dialog is closed (the orama variant nests it correctly).
const appId = "0T4ZBDJ3AF";
const apiKey = "9b74c8a3bba6e59a00209193be3eb63a";
const indexName = "builder-hub";

const client = liteClient(appId, apiKey);

const tagItems = [
  { name: "Docs", value: "docs" },
  { name: "Academy", value: "academy" },
  { name: "Integrations & Guides", value: "ig" },
];

export default function CustomSearchDialog(props: SharedProps) {
  const [tag, setTag] = useState<string | undefined>(undefined);
  const { search, setSearch, query } = useDocsSearch({
    type: "algolia",
    client,
    indexName,
    tag,
  });

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={query.data !== "empty" ? query.data : null} />
        <SearchDialogFooter>
          <TagsList tag={tag} onTagChange={setTag} allowClear>
            {tagItems.map((item) => (
              <TagsListItem key={item.value} value={item.value}>
                {item.name}
              </TagsListItem>
            ))}
          </TagsList>
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
