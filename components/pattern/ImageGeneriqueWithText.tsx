import Image from 'next/image';
import { useOption } from "@/context/OptionsContext";

const ImageGeneriqueWithText = ({imageType, imageName, width, height, translations = null, defaultType = null, defaultName = null}) => {
  const { option, getImageUrl } = useOption();
  if (imageType == null || imageName == null)
  {
    return <Image src={getImageUrl(`${defaultType}/${defaultName}.webp`)} alt="" width={width} height={height}/>
  }
  else
  {
    return <Image src={getImageUrl(`${imageType}/${imageName}.webp`)} alt="" width={width} height={height}/>
  }
};

export default ImageGeneriqueWithText;
