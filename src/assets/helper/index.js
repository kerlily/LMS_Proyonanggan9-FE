const images = import.meta.glob(
  ['./*.png', './*.jpg', './*.jpeg'],
  {
    eager: true,
    import: 'default',
  }
);

export default images;
