import { useNavigate } from "react-router-dom";
import { specialityData } from "../assets";

const SpecialityMenu = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center gap-4 py-16 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-medium">Browse by Speciality</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Search specialists by expertise, check availability, and book the time
        that works for you — fast and secure.
      </p>
      <div className="flex sm:justify-center gap-4 pt-5 w-full overflow-scroll">
        {specialityData.map((item, index) => (
          <div
            onClick={() => {
              navigate(`/doctors/${item.slug}`);
              setTimeout(() => {
                scrollTo(0, 0);
              }, 100);
            }}
            className="flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500"
            key={index}
          >
            <img
              className="w-16 sm:w-24 mb-2"
              src={item.image}
              alt={`${item.speciality} icon`}
            />
            <p>{item.speciality}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
