import './ShareInviteButton.css';
import React, { useState } from 'react';
import Popup from './Popup';
 
function ShareInviteButton(props) {
  const [isOpen, setIsOpen] = useState(false);
 
  const clipBoard = navigator.clipboard;

  function handleClick(linkEnd) {
    const link = 'https://ymeets.com/' + linkEnd;

    clipBoard.writeText(link)
      .then(() => {
        console.log('Link copied to clipboard: ' + link);
      })
      .catch((error) => {
        console.error('Error copying link to clipboard: ', error);
      });
  }

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  return <div>
    <input
      type="button"
      value="Share Invite"
      onClick={togglePopup}
    />
    
    {isOpen && <Popup
      content={<>
        <div className="copy-head">Copy Link Below!</div>
        <div class="link">
          <div className="pen-url">
            {"https://ymeets.com/" + props.ending}<button class="copy-link" onclick={handleClick(props.ending)}>Copy</button>
          </div>
        </div>
      </>}

      handleClose={togglePopup}
    />}
  </div>
}
 
export default ShareInviteButton;
