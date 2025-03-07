import Image from 'next/image';
import { useOption } from "@/context/OptionsContext";

const ImageGeneriqueWithText = ({imageType, imageName, width = 100, height = 100, translations = null, defaultType = null, defaultName = null, className = "", alt = "", onClick}) => {
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
