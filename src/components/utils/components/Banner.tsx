import { MdOutlineClose } from 'react-icons/md';
import { useState } from 'react';

interface Props {
  title: string;
  text?: string;
}

export default function Banner({ title, text }: Props) {
  const [bannerVisible, setBannerVisible] = useState(
    localStorage.getItem('hasClosedBefore') !== 'true'
  );

  return (
    <>
      {bannerVisible && (
        <div className="w-full opacity-80 bg-white p-4">
          <div className="flex flex-row">
            <button
              onClick={() => {
                setBannerVisible(false);
                localStorage.setItem('hasClosedBefore', 'true');
              }}
              className="mr-3 text-lg"
            >
              <MdOutlineClose size={28} />
            </button>

            <p className="font-bold mr-1">{title} - </p>

            {/* <a target="_blank" href="https://forms.gle/PPiGK3DKWXgV4rLUA">
                        <p className="underline">{text}</p>
                    </a> */}
            <a data-canny-link href="https://ymeets.canny.io">
              <p className="underline">{text}</p>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
