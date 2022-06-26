import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/autoplay";
import img1 from "./assets/images/2.jpg";

const App = () => {
  return (
    <Swiper modules={[Autoplay]} slidesPerView={1} autoplay={{ delay: 5000 }}>
      <SwiperSlide
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src={img1} alt="" />
      </SwiperSlide>
    </Swiper>
  );
};

export default App;
