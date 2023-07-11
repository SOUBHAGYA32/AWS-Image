import "./App.css";
import { React, useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [imageKey, setImageKey] = useState(null);
  const [imageUrl, setImageUrl] = useState(null)

  const handleImageChange = (event) => {
    setSelectedImage(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      try {
        await axios
          .post("api/v1/uploadImage", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            console.log(res);
            localStorage.setItem("key", res.data.key);
            setImageUrl(res.data.url)
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    } else {
      setUploadStatus("No image selected");
    }
  };

  return (
    <div className="App">
      <div>
        <h2>Image Upload</h2>
        <form onSubmit={handleFormSubmit}>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button type="submit">Upload</button>
        </form>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
      <div>
        <h1>Image Display</h1>
        <img src={imageUrl} alt="Displayed Image" />
      </div>
    </div>
  );
}

export default App;
