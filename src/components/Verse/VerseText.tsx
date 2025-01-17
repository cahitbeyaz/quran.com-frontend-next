import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Word from 'types/Word';
import classNames from 'classnames';
import { getWordDataFromLocation } from 'src/utils/verse';
import { selectReadingPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import QuranWord from '../dls/QuranWord/QuranWord';
import { QuranReaderStyles, selectQuranReaderStyles } from '../../redux/slices/QuranReader/styles';
import isCenterAlignedPage from './pageUtils';
import styles from './VerseText.module.scss';
import ChapterHeader from '../chapters/ChapterHeader';

type VerseTextProps = {
  words: Word[];
  isReadingMode?: boolean;
};

const VerseText = ({ words, isReadingMode = false }: VerseTextProps) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles) as QuranReaderStyles;
  const { quranTextFontScale } = quranReaderStyles;
  const { lineNumber, pageNumber, location } = words[0];
  const { showWordByWordTranslation, showWordByWordTransliteration } =
    useSelector(selectReadingPreferences);
  const centerAlignPage = useMemo(
    () => isCenterAlignedPage(pageNumber, lineNumber),
    [pageNumber, lineNumber],
  );
  const firstWordData = getWordDataFromLocation(location);
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  const isBigTextLayout = isWordByWordLayout || (isReadingMode && quranTextFontScale > 3);

  return (
    <>
      {isReadingMode && firstWordData.isFirstWordOfFirstVerseOfSurah && (
        <ChapterHeader chapterId={firstWordData.chapterId} />
      )}
      <div
        className={classNames(
          styles.verseTextContainer,
          styles[`quran-font-size-${quranTextFontScale}`],
          { [styles.largeQuranTextLayoutContainer]: isBigTextLayout },
        )}
      >
        <div
          className={classNames(styles.verseText, {
            [styles.verseTextWrap]: !isReadingMode,
            [styles.largeQuranTextLayout]: isBigTextLayout,
            [styles.verseTextCenterAlign]: isReadingMode && centerAlignPage,
            [styles.verseTextSpaceBetween]: isReadingMode && !centerAlignPage,
          })}
        >
          {words?.map((word) => (
            <QuranWord key={word.location} word={word} font={quranReaderStyles.quranFont} />
          ))}
        </div>
      </div>
    </>
  );
};

export default React.memo(VerseText);
