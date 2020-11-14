import React from 'react';
import AppButton from '../../components/AppButton/AppButton';
import { addSubtitlesToFilm } from '../../utils/comms';

const FilmDetailsSubtitleUpload = (props: {
  id: string;
}) => {
  const upload = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.srt';
    input.style.display = 'none';

    function onFile(this: any) {
      const file = this.files[ 0 ] as File;
      file.arrayBuffer().then((buffer) => {
        addSubtitlesToFilm(props.id, Buffer.from(buffer));
      });
    }

    input.addEventListener('change', onFile);
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  return (
    <AppButton type="secondary" text="Upload subtitles" onClick={ upload } />
  );
};

export default FilmDetailsSubtitleUpload;
