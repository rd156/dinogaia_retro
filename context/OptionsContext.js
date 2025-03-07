import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from "@/config/config";

const OptionContext = createContext();

export const OptionProvider = ({ children }) => {
  const [option, setOption] = useState(null);

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const cachedOption = localStorage.getItem("option");
        if (cachedOption) {
          const parsedOption = JSON.parse(cachedOption);
          setOption(parsedOption);
          console.log("Load Config:", parsedOption);
        } else {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_URL}/account/setting/get`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (data && typeof data === "object" && Object.keys(data).length > 0)
          {
            console.log("Get Config:", data);
            setOption(data);
            localStorage.setItem("option", JSON.stringify(data));
          }
          else
          {
            const defaultSettings = {
              "language": "fr",
              "image_template": "reborn",
              "display_template": ""
            };
            setOption(defaultSettings);
            console.log("Error Config:", defaultSettings);
          }

        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'option:", error);
      }
    };

    fetchOption();
  }, []);

  const getImageUrl = (itemName) => {
    if (!option || !option.image_template || option.image_template === "") {
      console.log("Image default");
      return `/template_image/reborn/${itemName}`;
    }
  
    console.log("Image other");
    return `/template_image/${option.image_template}/${itemName}`;
  };

  const updateImageTemplate = (newImageTemplate) => {
    setOption((prevOption) => {
      const updatedOption = { ...prevOption, image_template: newImageTemplate };
      localStorage.setItem("option", JSON.stringify(updatedOption));
      return updatedOption;
    });
  };
  const updateLanguage = (newLanguage) => {
    setOption((prevOption) => {
      const updatedOption = { ...prevOption, language: newLanguage };
      localStorage.setItem("option", JSON.stringify(updatedOption));
      return updatedOption;
    });
  };
  
  const updateDisplayTemplate = (newDisplayTemplate) => {
    setOption((prevOption) => {
      const updatedOption = { ...prevOption, display_template: newDisplayTemplate };
      localStorage.setItem("option", JSON.stringify(updatedOption));
      return updatedOption;
    });
  };
  
  return (
    <OptionContext.Provider value={{option, getImageUrl, updateImageTemplate, updateLanguage, updateDisplayTemplate}}>
      {children}
    </OptionContext.Provider>
  );
};

export const useOption = () => useContext(OptionContext);