import React from 'react';
import Error from 'next/error';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';

import { ChapterResponse, VersesResponse } from 'types/APIResponses';
import NextSeoHead from 'src/components/NextSeoHead';
import { getDefaultWordFields } from 'src/utils/api';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidChapterId } from '../../utils/validator';
import { getChapter, getChapterVerses } from '../../api';
import QuranReader from '../../components/QuranReader';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
};

const Chapter: NextPage<ChapterProps> = ({ chapterResponse, versesResponse, hasError }) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <NextSeoHead
        title={`Surah ${chapterResponse.chapter.nameSimple} - 1-${chapterResponse.chapter.versesCount}`}
      />
      <QuranReader initialData={versesResponse} id={chapterResponse.chapter.id} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const chapterId = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId)) {
    return {
      notFound: true,
    };
  }
  const [chapterResponse, versesResponse] = await Promise.all([
    getChapter(chapterId, locale),
    getChapterVerses(chapterId, {
      ...getDefaultWordFields(),
    }),
  ]);
  // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
  if (chapterResponse.status === 500 || versesResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
  return {
    props: {
      chapterResponse,
      versesResponse,
    },
    revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // chapters will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default Chapter;
