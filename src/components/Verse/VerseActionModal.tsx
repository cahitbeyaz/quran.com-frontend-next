import { useCallback, Dispatch, SetStateAction, ReactNode } from 'react';
import Verse from 'types/Verse';
import Modal from '../dls/Modal/Modal';
import VerseAdvancedCopy from './AdvancedCopy/VerseAdvancedCopy';
import styles from './VerseActionModal.module.scss';

export enum VerseActionModalType {
  AdvancedCopy = 'advancedCopy',
}

const MODAL_TYPE_TITLE = {
  [VerseActionModalType.AdvancedCopy]: 'Advance copy options',
};

interface Props {
  activeVerseActionModal: VerseActionModalType;
  verse: Verse;
  setActiveVerseActionModal: Dispatch<SetStateAction<VerseActionModalType>>;
}

const VerseActionModal: React.FC<Props> = ({
  activeVerseActionModal,
  verse,
  setActiveVerseActionModal,
}) => {
  // handle when the modal is closed.
  const onClose = useCallback(() => {
    setActiveVerseActionModal(null);
  }, [setActiveVerseActionModal]);

  // no need to render anything to the DOM if the modal is not meant to be visible.
  if (!activeVerseActionModal) {
    return null;
  }

  let modalContent: ReactNode;
  // this will be extended to include tafsirs and share
  if (activeVerseActionModal === VerseActionModalType.AdvancedCopy) {
    modalContent = <VerseAdvancedCopy verse={verse} />;
  }

  return (
    <Modal
      visible
      title={
        <div className={styles.titleContainer}>{[MODAL_TYPE_TITLE[activeVerseActionModal]]}</div>
      }
      onClose={onClose}
    >
      {modalContent}
    </Modal>
  );
};

export default VerseActionModal;
