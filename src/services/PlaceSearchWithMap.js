import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { fetchAutocomplete, fetchPlaceDetails } from "./googlePlacesService";

const containerStyle = {
   width: "100%",
   height: "300px",
   borderRadius: "10px",
};

// Google 공식 문서 A표 + 확장 장소유형 → 그룹 라벨 매핑
const placeTypeGroups = {
   자동차: {
      label: "자동차",
      types: [
         "car_dealer",
         "car_rental",
         "car_repair",
         "car_wash",
         "electric_vehicle_charging_station",
         "gas_station",
         "parking",
         "rest_stop",
      ],
   },
   비즈니스: {
      label: "비즈니스",
      types: [
         "corporate_office",
         "farm",
         "ranch",
         "finance",
         "general_contractor",
      ],
   },
   문화: {
      label: "문화",
      types: [
         "art_gallery",
         "art_studio",
         "auditorium",
         "cultural_landmark",
         "historical_place",
         "monument",
         "museum",
         "performing_arts_theater",
         "sculpture",
         "landmark",
      ],
   },
   교육: {
      label: "교육",
      types: [
         "library",
         "preschool",
         "primary_school",
         "school",
         "secondary_school",
         "university",
      ],
   },
   엔터테인먼트: {
      label: "엔터테인먼트",
      types: [
         "amusement_center",
         "amusement_park",
         "aquarium",
         "banquet_hall",
         "bowling_alley",
         "casino",
         "community_center",
         "cultural_center",
         "dog_park",
         "event_venue",
         "historical_landmark",
         "marina",
         "movie_rental",
         "movie_theater",
         "national_park",
         "night_club",
         "park",
         "planetarium",
         "plaza",
         "roller_coaster",
         "skateboard_park",
         "state_park",
         "tourist_attraction",
         "video_arcade",
         "visitor_center",
         "water_park",
         "wedding_venue",
         "wildlife_park",
         "wildlife_refuge",
         "zoo",
      ],
   },
   시설: {
      label: "시설",
      types: [
         "public_bath",
         "public_bathroom",
         "stable",
         "post_box",
         "room",
         "floor",
         "premise",
         "subpremise",
      ],
   },
   금융: {
      label: "금융",
      types: ["accounting", "atm", "bank"],
   },
   식음료: {
      label: "식음료",
      types: [
         "bakery",
         "bar",
         "barbecue_restaurant",
         "cafe",
         "coffee_shop",
         "donut_shop",
         "fast_food_restaurant",
         "fine_dining_restaurant",
         "food_court",
         "hamburger_restaurant",
         "ice_cream_shop",
         "meal_delivery",
         "meal_takeaway",
         "pizza_restaurant",
         "restaurant",
         "seafood_restaurant",
         "sushi_restaurant",
         "food",
      ],
   },
   지역: {
      label: "지역",
      types: [
         "administrative_area_level_1",
         "administrative_area_level_2",
         "administrative_area_level_3",
         "administrative_area_level_4",
         "administrative_area_level_5",
         "administrative_area_level_6",
         "administrative_area_level_7",
         "archipelago",
         "colloquial_area",
         "continent",
         "country",
         "locality",
         "neighborhood",
         "postal_code",
         "postal_code_prefix",
         "postal_code_suffix",
         "postal_town",
         "school_district",
         "sublocality",
         "sublocality_level_1",
         "sublocality_level_2",
         "sublocality_level_3",
         "sublocality_level_4",
         "sublocality_level_5",
      ],
   },
   정부기관: {
      label: "정부기관",
      types: [
         "city_hall",
         "courthouse",
         "embassy",
         "fire_station",
         "government_office",
         "local_government_office",
         "police",
         "post_office",
      ],
   },
   "건강·웰니스": {
      label: "건강·웰니스",
      types: [
         "chiropractor",
         "dental_clinic",
         "dentist",
         "doctor",
         "drugstore",
         "hospital",
         "medical_lab",
         "pharmacy",
         "physiotherapist",
         "spa",
         "health",
      ],
   },
   "예배 장소": {
      label: "예배 장소",
      types: [
         "church",
         "hindu_temple",
         "mosque",
         "synagogue",
         "place_of_worship",
      ],
   },
   교통: {
      label: "교통",
      types: [
         "airport",
         "bus_station",
         "bus_stop",
         "ferry_terminal",
         "heliport",
         "light_rail_station",
         "intersection",
         "route",
         "street_address",
         "street_number",
      ],
   },
   서비스: {
      label: "서비스",
      types: [
         "barber_shop",
         "beauty_salon",
         "cemetery",
         "child_care_agency",
         "electrician",
         "florist",
         "funeral_home",
         "hair_care",
         "insurance_agency",
         "laundry",
         "lawyer",
         "locksmith",
         "moving_company",
         "nail_salon",
         "painter",
         "plumber",
         "real_estate_agency",
         "storage",
         "tailor",
         "travel_agency",
         "veterinary_care",
      ],
   },
   쇼핑: {
      label: "쇼핑",
      types: [
         "bicycle_store",
         "book_store",
         "clothing_store",
         "convenience_store",
         "department_store",
         "electronics_store",
         "furniture_store",
         "gift_shop",
         "grocery_store",
         "hardware_store",
         "home_goods_store",
         "jewelry_store",
         "liquor_store",
         "pet_store",
         "shoe_store",
         "shopping_mall",
         "sporting_goods_store",
         "store",
         "supermarket",
      ],
   },
   스포츠: {
      label: "스포츠",
      types: [
         "arena",
         "athletic_field",
         "fitness_center",
         "golf_course",
         "gym",
         "playground",
         "ski_resort",
         "sports_club",
         "sports_complex",
         "stadium",
         "swimming_pool",
      ],
   },
   자연: {
      label: "자연",
      types: ["beach", "natural_feature"],
   },
};

const PlaceSearchWithMap = ({ onPlaceSelected, defaultValue = "" }) => {
   const [input, setInput] = useState(defaultValue); // 입력창 값
   const [options, setOptions] = useState([]); // 자동완성 리스트 (장소 목록)
   const [selectedPlace, setSelectedPlace] = useState(null); // 선택한 장소 정보
   const [confirmed, setConfirmed] = useState(false); // 리스트에서 장소 선택 여부
   const [isFreeText, setIsFreeText] = useState(false); // 일반 텍스트 입력 여부

   // defaultValue가 바뀔 때 input에 반영되도록 처리
   useEffect(() => {
      setInput(defaultValue);
   }, [defaultValue]);

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
      const ignored = [
         "establishment",
         "point_of_interest",
         "tourist_attraction",
      ]; // 의미없는값 제외
      const filtered = types.filter((t) => !ignored.includes(t));
      const labels = Object.values(placeTypeGroups).reduce((acc, group) => {
         if (group.types.some((type) => filtered.includes(type))) {
            acc.push(group.label);
         }
         return acc;
      }, []);
      return [...new Set(labels)];
   };

   // 장소 선택시 상세 정보 요청 호출
   const handlePlaceClick = async (place) => {
      const details = await fetchPlaceDetails(place.place_id); // place_id값으로 장소 상세 정보 조회(백 요청)
      console.log(details);
      const location = details.geometry?.location; // 위치 정보 담기 (위도, 경도)
      const groupLabels = getMatchedGroupLabels(details.types); // ✅ 여기서 호출됨
      if (!location) return;

      const selected = {
         name: details.name, // 장소 이름 (ex. 경복궁)
         place_id: place.place_id, // 장소id (ex. ChIJz6DBYxuifDURd9bZD1s9Y9Q)
         address: details.formatted_address, // 주소 (ex. 대한민국 서울특별시 종로구 사직로 161)
         types: groupLabels.join(","), // 장소 유형 (ex. [ "tourist_attraction", "point_of_interest", "establishment" ])
         lat: location.lat, // 위도
         lng: location.lng, // 경도
      };

      setSelectedPlace(selected); // 선택한 장소 정보 설정
      setInput(details.name); // 입력창에 장소 이름 설정
      setOptions([]); // 자동완성 리스트 초기화
      setIsFreeText(false); // 구글 장소 선택했으므로 텍스트로 값 설정 X
      setConfirmed(false); // ✅ 선택했지만 아직 지도에서 확정 전이므로 false 유지
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
               setTimeout(() => {
                  if (!confirmed && input.trim() && !selectedPlace) {
                     handleFreeTextConfirm();
                  }
               }, 150);
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
