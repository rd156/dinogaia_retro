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
          console.log("Get Config:", data);
          setOption(data);
          localStorage.setItem("option", JSON.stringify(data));
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
      return `/${itemName}`;
    }
  
    if (option.image_template === "reborn") {
      console.log("Image reborn");
      return `/${itemName}`;
    }
  
    console.log("Image other");
    return `/template_image/${option.image_template}/${itemName}`;
  };

  const updateImageTemplate = (newImageTemplate) => {
    setOption((prevOption) => {
      const updatedOption = { ...prevOption, image_template: newImageTemplate };
      localStorage.setItem("option", JSON.stringify(updatedOption)); // Met à jour localStorage
      return updatedOption; // Retourne l'option mise à jour
    });
  };

  return (
    <OptionContext.Provider value={{option, getImageUrl, updateImageTemplate}}>
      {children}
    </OptionContext.Provider>
  );
};

export const useOption = () => useContext(OptionContext);