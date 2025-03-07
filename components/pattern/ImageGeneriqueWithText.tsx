import Image from 'next/image';
import { useOption } from "@/context/OptionsContext";

const ImageGeneriqueWithText = ({imageType, imageName, width, height, translations = null, defaultType = null, defaultName = null, className = "", alt = ""}) => {
  const { option, getImageUrl } = useOption();
  if (imageType == null || imageName == null)
  {
    return <Image src={getImageUrl(`${defaultType}/${defaultName}.webp`)} alt={alt} width={width} height={height} className={className}/>
  }
  else
  {
    return <Image src={getImageUrl(`${imageType}/${imageName}.webp`)} alt={alt} width={width} height={height} className={className}/>
  }
};

export default ImageGeneriqueWithText;
