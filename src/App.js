import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import { HubConnectionBuilder } from "@microsoft/signalr/";
import "swiper/css";
import "swiper/css/autoplay";

import useCountdown from "./hooks/useCountdown";

const apiUrl = "http://10.50.4.5:8888/api/qcnotification";
// const apiUrl = "https://localhost:44391/api/qcnotification";
const signalHub = "http://10.50.4.5:8888/signalhub";
// const signalHub = "https://localhost:44391/signalhub";

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const { id } = useParams();
  const [connection, setConnection] = useState(null);
  const [currentWarning, setCurrentWarning] = useState("");
  const [validTo, setValidTo] = useState(null);
  const [minutes, seconds] = useCountdown(validTo);

  useEffect(() => {
    const connect = new HubConnectionBuilder()
      .withUrl(signalHub, { withCredentials: false })
      .withAutomaticReconnect()
      .build();

    setConnection(connect);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          connection.on("StartQCWarning", (warningID, station) => {
            if (id.toLowerCase() === station.toLowerCase()) {
              setCurrentWarning(warningID);
              getWarning(id);
            }
          });
          connection.on("StopQCWarning", () => {
            setCurrentWarning("");
            getImages();
          });
        })
        .catch((error) => console.log(error));
    }
  }, [connection]);

  useEffect(() => {
    getImages();
  }, [id]);

  useEffect(() => {
    getLatestWarning();
  }, [currentWarning]);

  useEffect(() => {
    if (minutes + seconds <= 0) {
      setCurrentWarning("");
    }
  }, [minutes, seconds, currentWarning]);

  const getImages = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${apiUrl}/${id}`);
      setImages(data);
    } catch (error) {
      console.log(error);
    }
    setIsLoading();
  };

  const getLatestWarning = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/latestwarning/${id}`);
      if (res.status === 204) {
        getImages();
      } else if (res.status === 200) {
        setCurrentWarning(res.data.id);
        setValidTo(res.data.validTo);
        getWarning(res.data.id);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading();
  };

  const getWarning = async (id) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${apiUrl}/warning/${id}`);
      setImages(data);
    } catch (error) {
      console.log(error);
    }
    setIsLoading();
  };

  if (isLoading) {
    return <div>Loading</div>;
  } else {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          autoplay={{ delay: 8000 }}
          loop
          speed={1500}
        >
          {images.map((imgName, index) => (
            <SwiperSlide key={index}>
              <img
                src={
                  process.env.PUBLIC_URL + currentWarning === ""
                    ? `/images/${id}/${imgName}`
                    : `/images/warning/${currentWarning}/${imgName}`
                }
                alt=""
                style={{ maxHeight: "99vh", width: "100%" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }
};

export default App;
