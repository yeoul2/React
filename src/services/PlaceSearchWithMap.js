import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { fetchAutocomplete, fetchPlaceDetails } from "./googlePlacesService";

const containerStyle = {
   width: "100%",
   height: "300px",
   borderRadius: "10px",
};

const placeTypeGroups = { // 장소유형 매핑(영어->한글)
	food: {
		label: "식음료",
		icon: "🍽️",
		types: ["restaurant", "cafe", "bar", "bakery", "meal_delivery", "meal_takeaway", "liquor_store"]
	},
	transport: {
		label: "교통시설",
		icon: "🚉",
		types: ["bus_station", "subway_station", "train_station", "transit_station", "taxi_stand", "airport", "parking"]
	},
	culture: {
		label: "문화·관광",
		icon: "🎨",
		types: ["museum", "art_gallery", "tourist_attraction", "movie_theater", "zoo", "amusement_park", "aquarium", "stadium"]
	},
	shopping: {
		label: "쇼핑",
		icon: "🛍️",
		types: ["shopping_mall", "department_store", "store", "clothing_store", "shoe_store", "book_store", "jewelry_store"]
	},
	lodging: {
		label: "숙박",
		icon: "🛏️",
		types: ["lodging", "rv_park", "campground"]
	},
	wellness: {
		label: "건강·휴식",
		icon: "🧖",
		types: ["gym", "spa", "beauty_salon", "hair_care"]
	},
	medical: {
		label: "의료",
		icon: "🏥",
		types: ["hospital", "pharmacy", "dentist", "doctor", "veterinary_care"]
	},
	service: {
		label: "생활편의",
		icon: "🧰",
		types: ["bank", "atm", "laundry", "gas_station", "post_office", "car_rental", "car_repair", "convenience_store"]
	},
	education: {
		label: "교육·공공기관",
		icon: "🏫",
		types: ["school", "university", "library", "city_hall", "police", "fire_station", "courthouse"]
	}
};

const PlaceSearchWithMap = ({ onPlaceSelected, defaultValue = "" }) => {
   const [input, setInput] = useState(defaultValue); // 입력창 값
   const [options, setOptions] = useState([]); // 자동완성 리스트 (장소 목록)
   const [selectedPlace, setSelectedPlace] = useState(null); // 선택한 장소 정보
   const [confirmed, setConfirmed] = useState(false); // 리스트에서 장소 선택 여부
   const [isFreeText, setIsFreeText] = useState(false); // 일반 텍스트 입력 여부

   // 자동완성(장소목록) 호출
   const handleInputChange = async (e) => {
      const value = e.target.value; // 사용자가 입력한 값 담기 (장소)
      setInput(value);
      setConfirmed(false);
      setIsFreeText(false); // 새 입력시 초기화
      if (value.trim()) {
         const res = await fetchAutocomplete(value); // 사용자가 입력한 값으로 구글 장소 검색(백 요청)
         setOptions(res); // 검색 결과를 옵션으로 설정
      } else {
         setOptions([]);
      }
   };

	// 장소 유형 라벨 값만 뽑아오기 & 중복된 값으로 매핑되면 제거하기
	const getMatchedGroupLabels = (types) => {
		if (!types) return [];
		const labels = Object.values(placeTypeGroups).reduce((acc, group) => {
			if (group.types.some(type => types.includes(type))) {
				acc.push(group.label);
			}
			return acc;
		}, []);
		return [...new Set(labels)]; // 중복 제거
	};

   // 장소 선택시 상세 정보 요청 호출
   const handlePlaceClick = async (place) => {
      const details = await fetchPlaceDetails(place.place_id); // place_id값으로 장소 상세 정보 조회(백 요청)
      console.log(details);
      const location = details.geometry?.location; // 위치 정보 담기 (위도, 경도)
      if (!location) return;

      const selected = {
         name: details.name, // 장소 이름 (ex. 경복궁)
         place_id: place.place_id, // 장소id (ex. ChIJz6DBYxuifDURd9bZD1s9Y9Q)
         address: details.formatted_address, // 주소 (ex. 대한민국 서울특별시 종로구 사직로 161)
         types: details.types, // 장소 유형 (ex. [ "tourist_attraction", "point_of_interest", "establishment" ])
         lat: location.lat, // 위도
         lng: location.lng, // 경도
      };

      setSelectedPlace(selected); // 선택한 장소 정보 설정
      setInput(details.name); // 입력창에 장소 이름 설정
      setOptions([]); // 자동완성 리스트 초기화
      setIsFreeText(false); // 구글 장소 선택했으므로 텍스트로 값 설정 X
      onPlaceSelected(selected, false); // 선택한 장소 정보 전달
      // ✅ 선택한 장소 정보와 장소 선택 여부를 부모 컴포넌트로 전달
      // ✅ `onPlaceSelected` 함수를 호출하면서 선택한 장소 정보와 `confirmed` 값을 전달합니다.
   };

   const handleFreeTextConfirm = () => {
      const freeTextPlace = {
         name: input,
         placeId: null,
         address: null,
         types: null,
         lat: null,
         lng: null,
      };
      setSelectedPlace(freeTextPlace);
      setOptions([]);
      setConfirmed(true);
      setIsFreeText(true);
      onPlaceSelected(freeTextPlace, true);
   };

   const handleConfirm = () => {
      // 지도에서 "선택" 버튼 클릭시 호출
      setConfirmed(true);
      if (selectedPlace) {
         onPlaceSelected(selectedPlace, true);
      }
   };

   return (
      <div className="space-y-2">
         <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="장소를 입력하세요"
            className="w-full border-gray-300 rounded-lg px-3 py-2"
            onBlur={() => {
               if (!confirmed && input.trim() && !selectedPlace) {
                  handleFreeTextConfirm();
               }
            }}
         />

         {/* 장소 결과 리스트로 띄우기(주소) */}
         {options.length > 0 && (
            <ul className="bg-white border w-full z-10 shadow rounded max-h-40 overflow-auto">
               <li
                  className="px-3 py-2 text-blue-600 font-semibold cursor-pointer border-b border-gray-200"
                  onClick={handleFreeTextConfirm}
               >
                  👉 "{input}" 그대로 사용하기
               </li>
               {options.map((place, idx) => (
                  <li
                     key={idx}
                     className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                     onClick={() => handlePlaceClick(place)}
                  >
                     {place.description}
                  </li>
               ))}
            </ul>
         )}

			{selectedPlace && confirmed && (
				<div className="text-sm text-gray-500">
					✅ 선택된 장소: {selectedPlace.name}
					{isFreeText && (
						<span className="text-orange-500 ml-2">(직접 입력됨)</span>
					)}
					{!isFreeText && selectedPlace.types && (
						<p className="mt-1">장소유형: {selectedPlace.types}</p>
					)}
				</div>
			)}

         {/* 리스트에서 선택한 장소를 지도에 마커 표시 밑 "선택" 버튼 */}
         {selectedPlace && !isFreeText && !confirmed && (
            <div className="space-y-2">
               <LoadScript
                  googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
               >
                  <GoogleMap
                     mapContainerStyle={containerStyle}
                     center={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                     zoom={15}
                  >
                     <Marker
                        position={{
                           lat: selectedPlace.lat,
                           lng: selectedPlace.lng,
                        }}
                     />
                  </GoogleMap>
               </LoadScript>
               <button
                  className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  onClick={handleConfirm}
               >
                  선택
               </button>
               <button
                  className="ml-5 mt-2 px-4 py-2 bg-white border border-orange-500 text-orange-500 rounded-lg"
                  onClick={() => {
                     setSelectedPlace(null);
                  }}
               >
                  닫기
               </button>
            </div>
         )}
      </div>
   );
};

export default PlaceSearchWithMap;
