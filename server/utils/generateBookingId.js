const generateBookingId = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MBS-${stamp}-${random}`;
};

export default generateBookingId;
