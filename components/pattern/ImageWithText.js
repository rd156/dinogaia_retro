import Image from 'next/image';
import styles from './ImageWithText.module.css';

const ImageWithText = ({src, alt, quantity }) => {
  return (
    <div className={styles.container}>
      <Image src={src} alt={alt} width={100} height={100} className={styles.image} />
      <span className={styles.text}>{quantity}</span>
    </div>
  );
};

export default ImageWithText;
