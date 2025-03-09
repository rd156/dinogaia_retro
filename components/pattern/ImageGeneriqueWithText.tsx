import Image from 'next/image';
import { useOption } from "@/context/OptionsContext";

type ImageGeneriqueWithTextProps = {
  imageType: string | null;
  imageName: string | null;
  width?: number;
  height?: number;
  translations?: any;
  defaultType?: string | null;
  defaultName?: string | null;
  className?: string;
  alt?: string;
  onClick?: () => void;
};

const ImageGeneriqueWithText = ({imageType, imageName, width = 100, height = 100, translations = null, defaultType = null, defaultName = null, className = "", alt = "", onClick} : ImageGeneriqueWithTextProps) => {
  const { option, getImageUrl } = useOption();
  if (imageType == null || imageName == null)
  {
    return <Image onClick={onClick} src={getImageUrl(`${defaultType}/${defaultName}.webp`)} alt={alt} width={width} height={height} className={className}/>
  }
  else
  {
    return <Image onClick={onClick} src={getImageUrl(`${imageType}/${imageName}.webp`)} alt={alt} width={width} height={height} className={className}/>
  }
};

export default ImageGeneriqueWithText;
