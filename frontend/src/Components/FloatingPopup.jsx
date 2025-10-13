// src/Components/FloatingPopup.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";

const FloatingPopup = ({ show, onHide,  duration = 2000 }) => {
  const [displayMessage, setDisplayMessage] = useState("");

  const comfortingMessages = [
    "Take your time. When you're ready, log in to explore this feature.",
    "You're doing great! Log in when you feel ready to dive deeper.",
    "No rush at all. Take your time to explore at your own pace.",
    "You're welcome here anytime. Log in when you're comfortable.",
    "There's no pressure. Come back whenever you're ready.",
    "You're taking care of yourself by going at your own pace. That's wonderful.",
    "It's okay to take things slowly. Log in when it feels right for you.",
    "You're exactly where you need to be right now. No hurry at all.",
    "Your wellbeing matters most. Take all the time you need.",
    "There's no timeline here. You're free to explore when you're ready.",
    "You're being gentle with yourself, and that's beautiful.",
    "Take a deep breath. You can log in whenever you feel ready.",
    "Your journey is your own. There's no right or wrong pace.",
    "You're already taking a positive step by being here. That's enough for now.",
    "It's perfectly okay to take your time. You're doing great.",
    "You're being mindful of your needs. That's a wonderful quality.",
    "There's no rush. You can explore when you feel comfortable.",
    "You're being kind to yourself by not pushing too hard. That's wisdom.",
    "Take all the time you need. Your wellbeing comes first.",
    "You're already here, and that's a beautiful start. No pressure to do more.",
    "It's okay to go slowly. You're listening to yourself, and that's important.",
    "You're being patient with yourself. That's a gift you're giving yourself.",
    "There's no deadline here. You can explore when you're ready.",
    "You're taking care of yourself by going at your own pace. That's self-love.",
    "It's perfectly fine to take your time. You're being thoughtful about your needs.",
    "You're already making progress just by being here. That's something to celebrate.",
    "Take a moment to breathe. You can log in when you feel ready.",
    "You're being gentle with yourself, and that's exactly what you need right now.",
    "There's no hurry. You're free to explore when it feels right for you.",
    "You're being mindful of your pace. That's a beautiful way to care for yourself."
  ];

  useEffect(() => {
    if (show) {
      // Select a random comforting message
      const randomIndex = Math.floor(Math.random() * comfortingMessages.length);
      setDisplayMessage(comfortingMessages[randomIndex]);
      
      const timer = setTimeout(onHide, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onHide, duration]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Body className="text-center">
        <span>{displayMessage}</span>
        <Button variant="secondary" onClick={onHide} className="mt-3">
          Close
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default FloatingPopup;