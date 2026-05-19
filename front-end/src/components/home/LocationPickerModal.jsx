import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import API_BASE_URL from '@config/api';
import styled, { keyframes } from 'styled-components';

const SUBURBS = [
  // ── GAUTENG ──────────────────────────────────────────
  // Johannesburg
  { suburb: 'Johannesburg CBD', city: 'Johannesburg', province: 'Gauteng', lat: -26.2041, lng: 28.0473 },
  { suburb: 'Sandton', city: 'Johannesburg', province: 'Gauteng', lat: -26.1076, lng: 28.0567 },
  { suburb: 'Rosebank', city: 'Johannesburg', province: 'Gauteng', lat: -26.1452, lng: 28.0436 },
  { suburb: 'Melville', city: 'Johannesburg', province: 'Gauteng', lat: -26.1792, lng: 28.0121 },
  { suburb: 'Randburg', city: 'Johannesburg', province: 'Gauteng', lat: -26.0942, lng: 27.9997 },
  { suburb: 'Midrand', city: 'Johannesburg', province: 'Gauteng', lat: -25.9939, lng: 28.1261 },
  { suburb: 'Fourways', city: 'Johannesburg', province: 'Gauteng', lat: -26.0258, lng: 28.0059 },
  { suburb: 'Bryanston', city: 'Johannesburg', province: 'Gauteng', lat: -26.0742, lng: 28.0191 },
  { suburb: 'Parkhurst', city: 'Johannesburg', province: 'Gauteng', lat: -26.1418, lng: 28.0094 },
  { suburb: 'Norwood', city: 'Johannesburg', province: 'Gauteng', lat: -26.1697, lng: 28.0780 },
  { suburb: 'Roodepoort', city: 'Johannesburg', province: 'Gauteng', lat: -26.1631, lng: 27.8739 },
  { suburb: 'Alexandra', city: 'Johannesburg', province: 'Gauteng', lat: -26.1067, lng: 28.0866 },
  { suburb: 'Hillbrow', city: 'Johannesburg', province: 'Gauteng', lat: -26.1951, lng: 28.0473 },
  { suburb: 'Yeoville', city: 'Johannesburg', province: 'Gauteng', lat: -26.1858, lng: 28.0644 },
  { suburb: 'Maboneng', city: 'Johannesburg', province: 'Gauteng', lat: -26.2022, lng: 28.0606 },
  { suburb: 'Newtown', city: 'Johannesburg', province: 'Gauteng', lat: -26.2007, lng: 28.0356 },
  { suburb: 'Soweto', city: 'Johannesburg', province: 'Gauteng', lat: -26.2671, lng: 27.8561 },
  { suburb: 'Orlando', city: 'Johannesburg', province: 'Gauteng', lat: -26.2513, lng: 27.8883 },
  { suburb: 'Meadowlands', city: 'Johannesburg', province: 'Gauteng', lat: -26.2308, lng: 27.8688 },
  { suburb: 'Pimville', city: 'Johannesburg', province: 'Gauteng', lat: -26.2800, lng: 27.8888 },
  { suburb: 'Protea Glen', city: 'Johannesburg', province: 'Gauteng', lat: -26.2750, lng: 27.8313 },
  { suburb: 'Dobsonville', city: 'Johannesburg', province: 'Gauteng', lat: -26.2480, lng: 27.8466 },
  { suburb: 'Diepkloof', city: 'Johannesburg', province: 'Gauteng', lat: -26.2475, lng: 27.8860 },
  { suburb: 'Eldorado Park', city: 'Johannesburg', province: 'Gauteng', lat: -26.2908, lng: 27.8991 },
  { suburb: 'Lenasia', city: 'Johannesburg', province: 'Gauteng', lat: -26.3041, lng: 27.8312 },
  { suburb: 'Orange Farm', city: 'Johannesburg', province: 'Gauteng', lat: -26.4817, lng: 27.8273 },
  { suburb: 'Diepsloot', city: 'Johannesburg', province: 'Gauteng', lat: -25.9318, lng: 28.0009 },
  { suburb: 'Cosmo City', city: 'Johannesburg', province: 'Gauteng', lat: -26.0458, lng: 27.9327 },
  { suburb: 'Waterfall', city: 'Johannesburg', province: 'Gauteng', lat: -25.9727, lng: 28.1014 },
  // Pretoria / Tshwane
  { suburb: 'Pretoria CBD', city: 'Pretoria', province: 'Gauteng', lat: -25.7459, lng: 28.1878 },
  { suburb: 'Centurion', city: 'Pretoria', province: 'Gauteng', lat: -25.8535, lng: 28.1887 },
  { suburb: 'Hatfield', city: 'Pretoria', province: 'Gauteng', lat: -25.7531, lng: 28.2273 },
  { suburb: 'Arcadia', city: 'Pretoria', province: 'Gauteng', lat: -25.7576, lng: 28.2156 },
  { suburb: 'Sunnyside', city: 'Pretoria', province: 'Gauteng', lat: -25.7598, lng: 28.2199 },
  { suburb: 'Brooklyn', city: 'Pretoria', province: 'Gauteng', lat: -25.7725, lng: 28.2408 },
  { suburb: 'Lynnwood', city: 'Pretoria', province: 'Gauteng', lat: -25.7733, lng: 28.2762 },
  { suburb: 'Menlyn', city: 'Pretoria', province: 'Gauteng', lat: -25.7842, lng: 28.2758 },
  { suburb: 'Montana', city: 'Pretoria', province: 'Gauteng', lat: -25.6773, lng: 28.2498 },
  { suburb: 'Pretoria North', city: 'Pretoria', province: 'Gauteng', lat: -25.6938, lng: 28.1886 },
  { suburb: 'Mamelodi', city: 'Pretoria', province: 'Gauteng', lat: -25.7109, lng: 28.3596 },
  { suburb: 'Atteridgeville', city: 'Pretoria', province: 'Gauteng', lat: -25.7875, lng: 28.1096 },
  { suburb: 'Soshanguve', city: 'Pretoria', province: 'Gauteng', lat: -25.5255, lng: 28.0951 },
  { suburb: 'Ga-Rankuwa', city: 'Pretoria', province: 'Gauteng', lat: -25.6236, lng: 27.9985 },
  { suburb: 'Mabopane', city: 'Pretoria', province: 'Gauteng', lat: -25.5003, lng: 28.0631 },
  { suburb: 'Laudium', city: 'Pretoria', province: 'Gauteng', lat: -25.8053, lng: 28.1101 },
  // Ekurhuleni (East Rand)
  { suburb: 'Kempton Park', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.1009, lng: 28.2289 },
  { suburb: 'Boksburg', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.2127, lng: 28.2607 },
  { suburb: 'Benoni', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.1875, lng: 28.3174 },
  { suburb: 'Brakpan', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.2353, lng: 28.3680 },
  { suburb: 'Springs', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.2513, lng: 28.4483 },
  { suburb: 'Germiston', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.2198, lng: 28.1592 },
  { suburb: 'Edenvale', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.1432, lng: 28.1701 },
  { suburb: 'Tembisa', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.0073, lng: 28.2219 },
  { suburb: 'Katlehong', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.3363, lng: 28.1622 },
  { suburb: 'Vosloorus', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.3530, lng: 28.1930 },
  { suburb: 'Thokoza', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.3410, lng: 28.1401 },
  { suburb: 'Daveyton', city: 'Ekurhuleni', province: 'Gauteng', lat: -26.1474, lng: 28.4043 },
  // West Rand
  { suburb: 'Krugersdorp', city: 'West Rand', province: 'Gauteng', lat: -26.0996, lng: 27.7694 },
  { suburb: 'Randfontein', city: 'West Rand', province: 'Gauteng', lat: -26.1875, lng: 27.7057 },
  { suburb: 'Kagiso', city: 'West Rand', province: 'Gauteng', lat: -26.1521, lng: 27.7844 },
  { suburb: 'Westonaria', city: 'West Rand', province: 'Gauteng', lat: -26.3163, lng: 27.6614 },

  // ── WESTERN CAPE ──────────────────────────────────────
  // Cape Town
  { suburb: 'Cape Town CBD', city: 'Cape Town', province: 'Western Cape', lat: -33.9249, lng: 18.4241 },
  { suburb: 'V&A Waterfront', city: 'Cape Town', province: 'Western Cape', lat: -33.9007, lng: 18.4193 },
  { suburb: 'Sea Point', city: 'Cape Town', province: 'Western Cape', lat: -33.9179, lng: 18.3955 },
  { suburb: 'Green Point', city: 'Cape Town', province: 'Western Cape', lat: -33.9062, lng: 18.4116 },
  { suburb: 'De Waterkant', city: 'Cape Town', province: 'Western Cape', lat: -33.9182, lng: 18.4178 },
  { suburb: 'Camps Bay', city: 'Cape Town', province: 'Western Cape', lat: -33.9473, lng: 18.3762 },
  { suburb: 'Clifton', city: 'Cape Town', province: 'Western Cape', lat: -33.9382, lng: 18.3786 },
  { suburb: 'Bo-Kaap', city: 'Cape Town', province: 'Western Cape', lat: -33.9271, lng: 18.4113 },
  { suburb: 'Woodstock', city: 'Cape Town', province: 'Western Cape', lat: -33.9347, lng: 18.4399 },
  { suburb: 'Observatory', city: 'Cape Town', province: 'Western Cape', lat: -33.9371, lng: 18.4725 },
  { suburb: 'Salt River', city: 'Cape Town', province: 'Western Cape', lat: -33.9278, lng: 18.4617 },
  { suburb: 'Claremont', city: 'Cape Town', province: 'Western Cape', lat: -33.9831, lng: 18.4666 },
  { suburb: 'Rondebosch', city: 'Cape Town', province: 'Western Cape', lat: -33.9667, lng: 18.4755 },
  { suburb: 'Newlands', city: 'Cape Town', province: 'Western Cape', lat: -33.9867, lng: 18.4651 },
  { suburb: 'Mowbray', city: 'Cape Town', province: 'Western Cape', lat: -33.9544, lng: 18.4738 },
  { suburb: 'Wynberg', city: 'Cape Town', province: 'Western Cape', lat: -34.0088, lng: 18.4737 },
  { suburb: 'Muizenberg', city: 'Cape Town', province: 'Western Cape', lat: -34.1042, lng: 18.4694 },
  { suburb: 'Constantia', city: 'Cape Town', province: 'Western Cape', lat: -34.0288, lng: 18.4456 },
  { suburb: 'Athlone', city: 'Cape Town', province: 'Western Cape', lat: -33.9706, lng: 18.5067 },
  { suburb: 'Hanover Park', city: 'Cape Town', province: 'Western Cape', lat: -33.9944, lng: 18.5277 },
  { suburb: 'Manenberg', city: 'Cape Town', province: 'Western Cape', lat: -33.9983, lng: 18.5476 },
  { suburb: 'Mitchells Plain', city: 'Cape Town', province: 'Western Cape', lat: -34.0456, lng: 18.6279 },
  { suburb: 'Khayelitsha', city: 'Cape Town', province: 'Western Cape', lat: -34.0386, lng: 18.6848 },
  { suburb: 'Gugulethu', city: 'Cape Town', province: 'Western Cape', lat: -33.9966, lng: 18.5687 },
  { suburb: 'Langa', city: 'Cape Town', province: 'Western Cape', lat: -33.9510, lng: 18.5366 },
  { suburb: 'Nyanga', city: 'Cape Town', province: 'Western Cape', lat: -34.0105, lng: 18.5901 },
  { suburb: 'Philippi', city: 'Cape Town', province: 'Western Cape', lat: -34.0175, lng: 18.5694 },
  { suburb: 'Bellville', city: 'Cape Town', province: 'Western Cape', lat: -33.8963, lng: 18.6334 },
  { suburb: 'Parow', city: 'Cape Town', province: 'Western Cape', lat: -33.8982, lng: 18.5856 },
  { suburb: 'Goodwood', city: 'Cape Town', province: 'Western Cape', lat: -33.9106, lng: 18.5558 },
  { suburb: 'Durbanville', city: 'Cape Town', province: 'Western Cape', lat: -33.8298, lng: 18.6492 },
  { suburb: 'Kraaifontein', city: 'Cape Town', province: 'Western Cape', lat: -33.8479, lng: 18.7199 },
  { suburb: 'Brackenfell', city: 'Cape Town', province: 'Western Cape', lat: -33.8671, lng: 18.7012 },
  { suburb: 'Kuils River', city: 'Cape Town', province: 'Western Cape', lat: -33.9379, lng: 18.7302 },
  { suburb: 'Somerset West', city: 'Cape Town', province: 'Western Cape', lat: -34.0769, lng: 18.8458 },
  { suburb: 'Strand', city: 'Cape Town', province: 'Western Cape', lat: -34.1154, lng: 18.8277 },
  // Other Western Cape
  { suburb: 'Stellenbosch', city: 'Stellenbosch', province: 'Western Cape', lat: -33.9321, lng: 18.8602 },
  { suburb: 'Paarl', city: 'Paarl', province: 'Western Cape', lat: -33.7306, lng: 18.9711 },
  { suburb: 'Franschhoek', city: 'Franschhoek', province: 'Western Cape', lat: -33.9087, lng: 19.1208 },
  { suburb: 'Wellington', city: 'Wellington', province: 'Western Cape', lat: -33.6409, lng: 19.0148 },
  { suburb: 'George', city: 'George', province: 'Western Cape', lat: -33.9630, lng: 22.4617 },
  { suburb: 'Mossel Bay', city: 'Mossel Bay', province: 'Western Cape', lat: -34.1826, lng: 22.1441 },
  { suburb: 'Knysna', city: 'Knysna', province: 'Western Cape', lat: -34.0355, lng: 23.0466 },
  { suburb: 'Oudtshoorn', city: 'Oudtshoorn', province: 'Western Cape', lat: -33.5903, lng: 22.2015 },
  { suburb: 'Worcester', city: 'Worcester', province: 'Western Cape', lat: -33.6458, lng: 19.4458 },
  { suburb: 'Hermanus', city: 'Hermanus', province: 'Western Cape', lat: -34.4212, lng: 19.2374 },
  { suburb: 'Swellendam', city: 'Swellendam', province: 'Western Cape', lat: -34.0234, lng: 20.4428 },

  // ── EASTERN CAPE ──────────────────────────────────────
  // Gqeberha (Port Elizabeth)
  { suburb: 'Gqeberha CBD', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9608, lng: 25.6022 },
  { suburb: 'Summerstrand', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9971, lng: 25.6591 },
  { suburb: 'Walmer', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9851, lng: 25.5943 },
  { suburb: 'Newton Park', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9579, lng: 25.5625 },
  { suburb: 'Greenacres', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9522, lng: 25.5738 },
  { suburb: 'Motherwell', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.8443, lng: 25.6234 },
  { suburb: 'Kwazakhele', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9192, lng: 25.5893 },
  { suburb: 'New Brighton', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.9225, lng: 25.6149 },
  { suburb: 'Uitenhage', city: 'Gqeberha', province: 'Eastern Cape', lat: -33.7622, lng: 25.3974 },
  // East London (Buffalo City)
  { suburb: 'East London CBD', city: 'East London', province: 'Eastern Cape', lat: -33.0292, lng: 27.8793 },
  { suburb: 'Vincent', city: 'East London', province: 'Eastern Cape', lat: -32.9964, lng: 27.8837 },
  { suburb: 'Cambridge', city: 'East London', province: 'Eastern Cape', lat: -32.9754, lng: 27.8704 },
  { suburb: 'Quigney', city: 'East London', province: 'Eastern Cape', lat: -33.0198, lng: 27.9010 },
  { suburb: 'Berea', city: 'East London', province: 'Eastern Cape', lat: -33.0071, lng: 27.8896 },
  { suburb: 'Nahoon', city: 'East London', province: 'Eastern Cape', lat: -32.9780, lng: 27.9418 },
  { suburb: 'Beacon Bay', city: 'East London', province: 'Eastern Cape', lat: -32.9792, lng: 27.9351 },
  { suburb: 'Mdantsane', city: 'East London', province: 'Eastern Cape', lat: -32.9591, lng: 27.7627 },
  { suburb: 'Duncan Village', city: 'East London', province: 'Eastern Cape', lat: -33.0023, lng: 27.8437 },
  // Other Eastern Cape
  { suburb: 'Mthatha CBD', city: 'Mthatha', province: 'Eastern Cape', lat: -31.5892, lng: 28.7857 },
  { suburb: 'Bhisho', city: 'Bhisho', province: 'Eastern Cape', lat: -32.8475, lng: 27.4347 },
  { suburb: 'Makhanda (Grahamstown)', city: 'Makhanda', province: 'Eastern Cape', lat: -33.3047, lng: 26.5310 },
  { suburb: 'Queenstown', city: 'Queenstown', province: 'Eastern Cape', lat: -31.8975, lng: 26.8726 },
  { suburb: 'Aliwal North', city: 'Aliwal North', province: 'Eastern Cape', lat: -30.6944, lng: 26.7115 },
  { suburb: 'King Williams Town', city: 'King Williams Town', province: 'Eastern Cape', lat: -32.8760, lng: 27.3988 },

  // ── KWAZULU-NATAL ─────────────────────────────────────
  // Durban (eThekwini)
  { suburb: 'Durban CBD', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218 },
  { suburb: 'Berea', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8458, lng: 31.0019 },
  { suburb: 'Morningside', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8468, lng: 31.0200 },
  { suburb: 'Glenwood', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8708, lng: 30.9965 },
  { suburb: 'Musgrave', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8558, lng: 30.9940 },
  { suburb: 'Westville', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8333, lng: 30.9376 },
  { suburb: 'Pinetown', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8114, lng: 30.8544 },
  { suburb: 'Chatsworth', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.8989, lng: 30.9295 },
  { suburb: 'Umlazi', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.9761, lng: 30.9001 },
  { suburb: 'KwaMashu', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7426, lng: 30.9929 },
  { suburb: 'Ntuzuma', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7636, lng: 30.9768 },
  { suburb: 'Inanda', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7196, lng: 30.9405 },
  { suburb: 'Phoenix', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7212, lng: 31.0017 },
  { suburb: 'Verulam', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.6395, lng: 31.0416 },
  { suburb: 'Tongaat', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.5674, lng: 31.1167 },
  { suburb: 'Umhlanga', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7234, lng: 31.0742 },
  { suburb: 'La Lucia', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7570, lng: 31.0621 },
  { suburb: 'Ballito', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.5368, lng: 31.2102 },
  { suburb: 'Amanzimtoti', city: 'Durban', province: 'KwaZulu-Natal', lat: -30.0558, lng: 30.8841 },
  { suburb: 'Isipingo', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.9914, lng: 30.9484 },
  { suburb: 'Prospecton', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.9686, lng: 30.9255 },
  { suburb: 'Hillcrest', city: 'Durban', province: 'KwaZulu-Natal', lat: -29.7725, lng: 30.7744 },
  // Pietermaritzburg
  { suburb: 'Pietermaritzburg CBD', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.6180, lng: 30.3920 },
  { suburb: 'Northdale', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.5895, lng: 30.4031 },
  { suburb: 'Edendale', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.6433, lng: 30.3467 },
  { suburb: 'Scottsville', city: 'Pietermaritzburg', province: 'KwaZulu-Natal', lat: -29.6314, lng: 30.4031 },
  // Other KZN
  { suburb: 'Richards Bay', city: 'Richards Bay', province: 'KwaZulu-Natal', lat: -28.7784, lng: 32.0381 },
  { suburb: 'Newcastle', city: 'Newcastle', province: 'KwaZulu-Natal', lat: -27.7623, lng: 29.9318 },
  { suburb: 'Ladysmith', city: 'Ladysmith', province: 'KwaZulu-Natal', lat: -28.5597, lng: 29.7814 },
  { suburb: 'Empangeni', city: 'Empangeni', province: 'KwaZulu-Natal', lat: -28.7533, lng: 31.8908 },
  { suburb: 'Ulundi', city: 'Ulundi', province: 'KwaZulu-Natal', lat: -28.3218, lng: 31.4155 },
  { suburb: 'Port Shepstone', city: 'Port Shepstone', province: 'KwaZulu-Natal', lat: -30.7364, lng: 30.4526 },

  // ── LIMPOPO ───────────────────────────────────────────
  { suburb: 'Polokwane CBD', city: 'Polokwane', province: 'Limpopo', lat: -23.9045, lng: 29.4688 },
  { suburb: 'Seshego', city: 'Polokwane', province: 'Limpopo', lat: -23.8702, lng: 29.4048 },
  { suburb: 'Bendor', city: 'Polokwane', province: 'Limpopo', lat: -23.9266, lng: 29.4722 },
  { suburb: 'Tzaneen', city: 'Tzaneen', province: 'Limpopo', lat: -23.8326, lng: 30.1644 },
  { suburb: 'Phalaborwa', city: 'Phalaborwa', province: 'Limpopo', lat: -23.9405, lng: 31.1531 },
  { suburb: 'Thohoyandou', city: 'Thohoyandou', province: 'Limpopo', lat: -22.9586, lng: 30.4868 },
  { suburb: 'Louis Trichardt', city: 'Louis Trichardt', province: 'Limpopo', lat: -23.0449, lng: 29.9112 },
  { suburb: 'Bela-Bela', city: 'Bela-Bela', province: 'Limpopo', lat: -24.8863, lng: 28.2903 },
  { suburb: 'Mokopane', city: 'Mokopane', province: 'Limpopo', lat: -24.2000, lng: 28.9583 },
  { suburb: 'Lephalale', city: 'Lephalale', province: 'Limpopo', lat: -23.6778, lng: 27.7131 },
  { suburb: 'Giyani', city: 'Giyani', province: 'Limpopo', lat: -23.3044, lng: 30.7186 },
  { suburb: 'Lebowakgomo', city: 'Lebowakgomo', province: 'Limpopo', lat: -24.0046, lng: 29.4856 },

  // ── MPUMALANGA ────────────────────────────────────────
  { suburb: 'Mbombela CBD', city: 'Mbombela', province: 'Mpumalanga', lat: -25.4753, lng: 30.9694 },
  { suburb: 'West Acres', city: 'Mbombela', province: 'Mpumalanga', lat: -25.4912, lng: 30.9567 },
  { suburb: 'Sonheuwel', city: 'Mbombela', province: 'Mpumalanga', lat: -25.4671, lng: 30.9822 },
  { suburb: 'eMalahleni', city: 'eMalahleni', province: 'Mpumalanga', lat: -25.8737, lng: 29.2404 },
  { suburb: 'Middelburg', city: 'Middelburg', province: 'Mpumalanga', lat: -25.7737, lng: 29.4628 },
  { suburb: 'Secunda', city: 'Secunda', province: 'Mpumalanga', lat: -26.5250, lng: 29.1689 },
  { suburb: 'Ermelo', city: 'Ermelo', province: 'Mpumalanga', lat: -26.5305, lng: 29.9824 },
  { suburb: 'Standerton', city: 'Standerton', province: 'Mpumalanga', lat: -26.9452, lng: 29.2428 },
  { suburb: 'Hazyview', city: 'Hazyview', province: 'Mpumalanga', lat: -25.0507, lng: 31.1288 },
  { suburb: 'White River', city: 'White River', province: 'Mpumalanga', lat: -25.3294, lng: 31.0059 },
  { suburb: 'Barberton', city: 'Barberton', province: 'Mpumalanga', lat: -25.7841, lng: 31.0526 },
  { suburb: 'Thulamahashe', city: 'Thulamahashe', province: 'Mpumalanga', lat: -24.7300, lng: 31.2053 },

  // ── NORTH WEST ────────────────────────────────────────
  { suburb: 'Rustenburg CBD', city: 'Rustenburg', province: 'North West', lat: -25.6671, lng: 27.2419 },
  { suburb: 'Tlhabane', city: 'Rustenburg', province: 'North West', lat: -25.6451, lng: 27.2188 },
  { suburb: 'Boitekong', city: 'Rustenburg', province: 'North West', lat: -25.6038, lng: 27.3032 },
  { suburb: 'Klerksdorp', city: 'Klerksdorp', province: 'North West', lat: -26.8676, lng: 26.6673 },
  { suburb: 'Jouberton', city: 'Klerksdorp', province: 'North West', lat: -26.8745, lng: 26.7108 },
  { suburb: 'Mafikeng', city: 'Mafikeng', province: 'North West', lat: -25.8488, lng: 25.6467 },
  { suburb: 'Mmabatho', city: 'Mafikeng', province: 'North West', lat: -25.8614, lng: 25.6315 },
  { suburb: 'Potchefstroom', city: 'Potchefstroom', province: 'North West', lat: -26.7138, lng: 27.0990 },
  { suburb: 'Brits', city: 'Brits', province: 'North West', lat: -25.6367, lng: 27.7831 },
  { suburb: 'Vryburg', city: 'Vryburg', province: 'North West', lat: -26.9554, lng: 24.7287 },
  { suburb: 'Lichtenburg', city: 'Lichtenburg', province: 'North West', lat: -26.1448, lng: 26.1634 },
  { suburb: 'Orkney', city: 'Orkney', province: 'North West', lat: -26.9866, lng: 26.6744 },

  // ── FREE STATE ────────────────────────────────────────
  { suburb: 'Bloemfontein CBD', city: 'Bloemfontein', province: 'Free State', lat: -29.0852, lng: 26.1596 },
  { suburb: 'Mangaung', city: 'Bloemfontein', province: 'Free State', lat: -29.1177, lng: 26.1924 },
  { suburb: 'Langenhoven Park', city: 'Bloemfontein', province: 'Free State', lat: -29.1246, lng: 26.1132 },
  { suburb: 'Bayswater', city: 'Bloemfontein', province: 'Free State', lat: -29.0759, lng: 26.2162 },
  { suburb: 'Westdene', city: 'Bloemfontein', province: 'Free State', lat: -29.1090, lng: 26.1890 },
  { suburb: 'Botshabelo', city: 'Botshabelo', province: 'Free State', lat: -29.2529, lng: 26.7094 },
  { suburb: 'Thaba Nchu', city: 'Thaba Nchu', province: 'Free State', lat: -29.2147, lng: 26.8228 },
  { suburb: 'Welkom', city: 'Welkom', province: 'Free State', lat: -27.9880, lng: 26.7352 },
  { suburb: 'Thabong', city: 'Welkom', province: 'Free State', lat: -28.0016, lng: 26.7530 },
  { suburb: 'Sasolburg', city: 'Sasolburg', province: 'Free State', lat: -26.8150, lng: 27.8283 },
  { suburb: 'Kroonstad', city: 'Kroonstad', province: 'Free State', lat: -27.6506, lng: 27.2351 },
  { suburb: 'Maokeng', city: 'Kroonstad', province: 'Free State', lat: -27.6640, lng: 27.2531 },
  { suburb: 'Bethlehem', city: 'Bethlehem', province: 'Free State', lat: -28.2311, lng: 28.3090 },
  { suburb: 'Phuthaditjhaba', city: 'Phuthaditjhaba', province: 'Free State', lat: -28.5281, lng: 28.8929 },
  { suburb: 'Parys', city: 'Parys', province: 'Free State', lat: -26.9016, lng: 27.4558 },

  // ── NORTHERN CAPE ─────────────────────────────────────
  { suburb: 'Kimberley CBD', city: 'Kimberley', province: 'Northern Cape', lat: -28.7282, lng: 24.7499 },
  { suburb: 'Galeshewe', city: 'Kimberley', province: 'Northern Cape', lat: -28.7133, lng: 24.7297 },
  { suburb: 'Roodepan', city: 'Kimberley', province: 'Northern Cape', lat: -28.7004, lng: 24.7781 },
  { suburb: 'Upington', city: 'Upington', province: 'Northern Cape', lat: -28.4478, lng: 21.2561 },
  { suburb: 'Springbok', city: 'Springbok', province: 'Northern Cape', lat: -29.6639, lng: 17.8865 },
  { suburb: 'De Aar', city: 'De Aar', province: 'Northern Cape', lat: -30.6471, lng: 24.0103 },
  { suburb: 'Kuruman', city: 'Kuruman', province: 'Northern Cape', lat: -27.4535, lng: 23.4330 },
  { suburb: 'Kathu', city: 'Kathu', province: 'Northern Cape', lat: -27.7007, lng: 23.0570 },
  { suburb: 'Carnarvon', city: 'Carnarvon', province: 'Northern Cape', lat: -30.9618, lng: 22.1304 },
  { suburb: 'Colesberg', city: 'Colesberg', province: 'Northern Cape', lat: -30.7248, lng: 25.0974 },
];

function findNearestSuburb(lat, lng) {
  let nearest = SUBURBS[0];
  let minDist = Infinity;
  for (const s of SUBURBS) {
    const d = Math.hypot(s.lat - lat, s.lng - lng);
    if (d < minDist) { minDist = d; nearest = s; }
  }
  return nearest;
}

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(16, 24, 40, 0.44);
  backdrop-filter: blur(4px);
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  width: min(720px, calc(100vw - 24px));
  margin: 0 auto 12px;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98)) padding-box,
    ${props => props.theme.colors.gradient.primary} border-box;
  border: 1px solid rgba(255,255,255,0.84);
  border-radius: 28px;
  max-height: min(86vh, 820px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 30px 96px rgba(16, 24, 40, 0.26);
  animation: ${slideUp} 0.32s cubic-bezier(0.34, 1.2, 0.64, 1);

  @media (max-width: 560px) {
    width: 100%;
    margin: 0;
    border-radius: 28px 28px 0 0;
    max-height: 88vh;
  }
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  margin: 12px auto 0;
  flex-shrink: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: clamp(20px, 5vw, 28px);
  font-weight: 950;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  letter-spacing: 0;
`;

const HeaderCopy = styled.p`
  margin: 4px 0 0;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.45;
  font-weight: 750;
`;

const HeroPanel = styled.div`
  margin: 0 20px 12px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(61, 129, 239, 0.16);
  background:
    linear-gradient(135deg, rgba(61,129,239,0.10), rgba(255,255,255,0.94) 54%, rgba(245,158,11,0.10));
  box-shadow: 0 16px 38px rgba(16,24,40,0.08);
  flex-shrink: 0;
`;

const HeroTitle = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: 15px;
  line-height: 1.25;
  font-weight: 950;
`;

const HeroSub = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 12px;
  line-height: 1.5;
  font-weight: 700;
  margin-top: 4px;
`;

const MetricRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  min-width: 0;
  padding: 10px;
  border-radius: 16px;
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(228,231,236,0.82);
`;

const MetricValue = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  font-weight: 950;
`;

const MetricLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 10px;
  font-weight: 850;
  margin-top: 2px;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid ${props => props.theme.colors.border.default};
  background: #ffffff;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
    color: ${props => props.theme.colors.primary};
    border-color: transparent;
  }
`;

const SearchWrap = styled.div`
  padding: 0 20px 12px;
  flex-shrink: 0;
`;

const SearchRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIconWrap = styled.span`
  position: absolute;
  left: 14px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 46px;
  padding: 0 16px 0 42px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  outline: none;
  transition: ${props => props.theme.transitions.swift};
  box-sizing: border-box;

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
    font-weight: 500;
  }

  &:focus {
    border-color: rgba(61, 129, 239, 0.42);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(61, 129, 239, 0.1);
  }
`;

const GPSButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 20px 4px;
  padding: 12px 14px;
  background: ${props => props.theme.colors.gradient?.soft || 'rgba(61, 129, 239, 0.06)'};
  border: 1px solid rgba(61, 129, 239, 0.2);
  border-radius: 16px;
  cursor: pointer;
  transition: ${props => props.theme.transitions.swift};
  flex-shrink: 0;
  text-align: left;

  &:hover:not(:disabled) {
    background: rgba(61, 129, 239, 0.1);
    border-color: rgba(61, 129, 239, 0.36);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const GPSIconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(61, 129, 239, 0.1);
  border: 1px solid rgba(61, 129, 239, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.theme.colors.primary};
`;

const GPSLabel = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary};
`;

const GPSSub = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(228, 231, 236, 0.72);
  margin: 8px 20px;
  flex-shrink: 0;
`;

const ListWrap = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 0 8px 116px;
  will-change: transform;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: rgba(228, 231, 236, 0.9);
    border-radius: 999px;
  }
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: ${props => props.theme.colors.text.secondary};
  letter-spacing: 0.06em;
  padding: 8px 12px 6px;
`;

const SuburbRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid ${props => props.$selected ? 'rgba(61,129,239,0.34)' : 'transparent'};
  border-radius: 16px;
  background: ${props => props.$selected ? props.theme.colors.primarySoftBg : props.$active ? 'rgba(61,129,239,0.06)' : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};
  content-visibility: auto;
  contain-intrinsic-size: 0 58px;

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const SuburbIconWrap = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: ${props => props.$active ? 'rgba(61, 129, 239, 0.1)' : 'rgba(248, 250, 252, 0.9)'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.22)' : 'rgba(228, 231, 236, 0.9)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
`;

const SuburbInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuburbName = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.primary};
`;

const SuburbCity = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 1px;
`;

const CheckCircle = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  font-weight: 600;
`;

const CoveragePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  background: ${p => {
    if (p.$tier === 'T0') return 'rgba(21, 161, 124, 0.12)';
    if (p.$tier === 'T1' || p.$tier === 'T2') return 'rgba(61, 129, 239, 0.1)';
    if (p.$tier === 'T3' || p.$tier === 'T4') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(228, 231, 236, 0.8)';
  }};
  color: ${p => {
    if (p.$tier === 'T0') return '#118264';
    if (p.$tier === 'T1' || p.$tier === 'T2') return '#3D81EF';
    if (p.$tier === 'T3' || p.$tier === 'T4') return '#B35A05';
    return '#888';
  }};
  border: 1px solid ${p => {
    if (p.$tier === 'T0') return 'rgba(21, 161, 124, 0.22)';
    if (p.$tier === 'T1' || p.$tier === 'T2') return 'rgba(61, 129, 239, 0.2)';
    if (p.$tier === 'T3' || p.$tier === 'T4') return 'rgba(245, 158, 11, 0.2)';
    return 'rgba(228, 231, 236, 0.9)';
  }};
`;

const GPSCoverageBox = styled.div`
  margin: 0 20px 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: rgba(21, 161, 124, 0.07);
  border: 1px solid rgba(21, 161, 124, 0.2);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GPSCoverageText = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: #118264;
  flex: 1;
`;

const GPSCoverageSub = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  border-radius: 999px;
  background: ${props => props.theme.colors.gradient.primary};
  border: none;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  flex-shrink: 0;
`;

const dotPulse = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1); }
`;

const CoverageLoadingDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  flex-shrink: 0;
  animation: ${dotPulse} 1.2s ease-in-out infinite;
`;

const ProvinceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 4px 4px 18px;

  @media (max-width: 360px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProvinceCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 16px 8px 14px;
  border-radius: 18px;
  border: 1.5px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.42)' : 'rgba(228, 231, 236, 0.9)'};
  background: ${props => props.$active ? props.theme.colors.primarySoftBg : 'rgba(248, 250, 252, 0.7)'};
  cursor: pointer;
  text-align: center;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(61, 129, 239, 0.38);
    background: ${props => props.theme.colors.primarySoftBg};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(61, 129, 239, 0.12);
  }
`;

const ProvinceIconCircle = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: ${props => props.$active ? 'rgba(61, 129, 239, 0.12)' : '#ffffff'};
  border: 1px solid ${props => props.$active ? 'rgba(61, 129, 239, 0.24)' : 'rgba(228, 231, 236, 0.9)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.secondary};
  font-size: 15px;
`;

const ProvinceName = styled.div`
  font-size: 11px;
  font-weight: 900;
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text.primary};
  line-height: 1.3;
`;

const ProvinceCount = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
`;

const ProvinceBreadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 20px 10px;
  padding: 9px 12px;
  background: ${props => props.theme.colors.primarySoftBg};
  border: 1px solid rgba(61, 129, 239, 0.2);
  border-radius: 14px;
  flex-shrink: 0;
`;

const ProvinceBreadcrumbBack = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(61, 129, 239, 0.25);
  background: #ffffff;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(61, 129, 239, 0.1);
  }
`;

const ProvinceBreadcrumbLabel = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: ${props => props.theme.colors.primary};
  flex: 1;
`;

const ProvinceBreadcrumbCount = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
`;

const RecentSection = styled.div`
  margin: 0 20px 10px;
  flex-shrink: 0;
`;

const SelectedCard = styled.div`
  margin: 0 20px 12px;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(61,129,239,0.18);
  background: rgba(61,129,239,0.06);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const SelectedMark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 13px;
  background: ${props => props.theme.colors.gradient.primary};
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const SelectedInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SelectedTitle = styled.div`
  font-size: 13px;
  font-weight: 950;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SelectedSub = styled.div`
  font-size: 11px;
  font-weight: 750;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 2px;
`;

const Footer = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.96) 22%, #fff);
  border-radius: 0 0 28px 28px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FooterInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FooterLabel = styled.div`
  font-size: 10px;
  font-weight: 900;
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const FooterValue = styled.div`
  margin-top: 2px;
  font-size: 13px;
  font-weight: 950;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FooterError = styled.div`
  margin-top: 3px;
  font-size: 11px;
  font-weight: 800;
  color: ${props => props.theme.colors.danger?.[600] || '#c62850'};
`;

const ConfirmAreaButton = styled.button`
  min-height: 46px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: ${props => props.$disabled ? 'rgba(228,231,236,0.9)' : props.theme.colors.gradient.primary};
  color: ${props => props.$disabled ? props.theme.colors.text.secondary : '#fff'};
  font-size: 13px;
  font-weight: 950;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  box-shadow: ${props => props.$disabled ? 'none' : '0 14px 28px rgba(61,129,239,0.24)'};
  white-space: nowrap;
`;

const RecentRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: ${props => props.theme.colors.primarySoftBg};
  }
`;

const RecentIconWrap = styled.span`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(228, 231, 236, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${props => props.theme.colors.text.secondary};
`;

const RecentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RecentSuburbName = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${props => props.theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RecentSuburbSub = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.secondary};
  margin-top: 1px;
`;

const RecentRemoveBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1px solid rgba(228, 231, 236, 0.9);
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
  transition: ${props => props.theme.transitions.swift};

  &:hover {
    background: rgba(228, 231, 236, 0.9);
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ProvinceCoverageDot = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => {
    if (p.$tier === 'T0') return '#15A17C';
    if (p.$tier === 'T1' || p.$tier === 'T2') return '#3D81EF';
    if (p.$tier === 'T3' || p.$tier === 'T4') return '#B35A05';
    return '#CCC';
  }};
  border: 1.5px solid #ffffff;
`;

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const GPSCrosshairIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

const SearchSVGIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

const CheckSVGIcon = () => (
  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-9" />
  </svg>
);

const BackChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const MapRegionIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);

export const LocationPickerModal = ({ currentLocation, onClose, onSelect }) => {
  const [search, setSearch] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const inputRef = useRef(null);
  const loadingRef = useRef(new Set());
  const [coverageMap, setCoverageMap] = useState({});
  const [gpsCoverage, setGpsCoverage] = useState(null);
  const [gpsResult, setGpsResult] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [provinceCoverage, setProvinceCoverage] = useState({});
  const [selectedArea, setSelectedArea] = useState(currentLocation || null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Load location history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shopply_location_history');
      if (stored) setLocationHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedProvince && !search.trim()) {
          setSelectedProvince(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, selectedProvince, search]);

  const grouped = useMemo(() => {
    const map = {};
    for (const s of SUBURBS) {
      if (!map[s.province]) map[s.province] = [];
      map[s.province].push(s);
    }
    return map;
  }, []);

  const provinces = useMemo(() => Object.keys(grouped), [grouped]);

  // Batch fetch province-level coverage on mount (one representative suburb per province)
  useEffect(() => {
    const locations = provinces.map(province => {
      const first = grouped[province][0];
      return { lat: first.lat, lng: first.lng, province };
    });
    fetch(`${API_BASE_URL}/hyperlocal/coverage-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations: locations.map(({ lat, lng }) => ({ lat, lng })) }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        const results = data.data?.results || [];
        const map = {};
        results.forEach((result, i) => {
          const prov = locations[i]?.province;
          if (prov) map[prov] = { tier: result.tier ?? null, count: result.estimatedResults ?? 0 };
        });
        setProvinceCoverage(map);
      })
      .catch(() => { /* ignore */ });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Batch fetch suburb-level coverage when a province is selected
  useEffect(() => {
    if (!selectedProvince) return;
    const suburbs = grouped[selectedProvince] || [];
    const toFetch = suburbs.filter(s => {
      const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
      return !loadingRef.current.has(key) && !coverageMap[key];
    });
    if (toFetch.length === 0) return;

    toFetch.forEach(s => {
      const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
      loadingRef.current.add(key);
    });
    setCoverageMap(prev => {
      const next = { ...prev };
      toFetch.forEach(s => {
        const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
        next[key] = { loading: true };
      });
      return next;
    });

    fetch(`${API_BASE_URL}/hyperlocal/coverage-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations: toFetch.map(s => ({ lat: s.lat, lng: s.lng })) }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.success) return;
        const results = data.data?.results || [];
        setCoverageMap(prev => {
          const next = { ...prev };
          results.forEach((result, i) => {
            const s = toFetch[i];
            if (!s) return;
            const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
            next[key] = {
              loading: false,
              tier: result.tier ?? null,
              tierLabel: result.tierLabel ?? null,
              count: result.estimatedResults ?? 0,
              nearestKm: result.nearestDistanceKm ?? null,
            };
          });
          return next;
        });
      })
      .catch(() => {
        setCoverageMap(prev => {
          const next = { ...prev };
          toFetch.forEach(s => {
            const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
            loadingRef.current.delete(key);
            next[key] = { loading: false, error: true };
          });
          return next;
        });
      });
  }, [selectedProvince, grouped]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSearching = Boolean(search.trim());

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.toLowerCase();
    return SUBURBS.filter(s =>
      s.suburb.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.province.toLowerCase().includes(q)
    );
  }, [search, isSearching]);

  const provinceSuburbs = selectedProvince ? grouped[selectedProvince] : [];

  const handleGPS = () => {
    if (!navigator.geolocation || detecting) return;
    setDetecting(true);
    setGpsResult(null);
    setGpsCoverage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestSuburb(latitude, longitude);
        const result = { lat: latitude, lng: longitude, suburb: nearest.suburb, city: nearest.city, province: nearest.province };
        setGpsResult(result);
        try {
          const res = await fetch(`${API_BASE_URL}/hyperlocal/nearest-availability?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (data.success) setGpsCoverage(data.data);
        } catch { /* ignore */ }
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const saveToHistory = useCallback((entry) => {
    setLocationHistory(prev => {
      const filtered = prev.filter(
        h => !(h.suburb === entry.suburb && h.city === entry.city && h.province === entry.province)
      );
      const next = [entry, ...filtered].slice(0, 3);
      try { localStorage.setItem('shopply_location_history', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleConfirmGPS = () => {
    if (gpsResult) {
      saveToHistory(gpsResult);
      setSelectedArea(gpsResult);
      setConfirmError('');
    }
  };

  const handleSelect = (s) => {
    const entry = { lat: s.lat, lng: s.lng, suburb: s.suburb, city: s.city, province: s.province };
    setSelectedArea(entry);
    setConfirmError('');
  };

  const handleConfirmSelection = async () => {
    if (!selectedArea) return;
    setConfirming(true);
    setConfirmError('');
    try {
      const response = await fetch(`${API_BASE_URL}/hyperlocal/delivery-area/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: selectedArea }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not confirm this delivery area.');
      }
      const confirmed = data.data?.location || selectedArea;
      saveToHistory(confirmed);
      onSelect(confirmed);
    } catch (error) {
      setConfirmError(error.message || 'Could not confirm this delivery area.');
    } finally {
      setConfirming(false);
    }
  };

  const handleRemoveHistory = useCallback((e, index) => {
    e.stopPropagation();
    setLocationHistory(prev => {
      const next = prev.filter((_, i) => i !== index);
      try { localStorage.setItem('shopply_location_history', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value.trim()) setSelectedProvince(null);
  };

  const isActive = (s) =>
    currentLocation?.suburb === s.suburb && currentLocation?.city === s.city;

  const isSelected = (s) =>
    selectedArea?.suburb === s.suburb && selectedArea?.city === s.city;

  const isActiveProvince = (province) =>
    currentLocation?.province === province;

  const coveredProvinceCount = Object.values(provinceCoverage).filter(c => c?.tier && c.count > 0).length;
  const selectedCoverage = selectedArea
    ? coverageMap[`${Number(selectedArea.lat).toFixed(4)},${Number(selectedArea.lng).toFixed(4)}`]
    : null;
  const selectedCoverageLabel =
    selectedCoverage?.loading ? 'Checking availability...' :
    selectedCoverage?.tier === 'T0' ? 'Local availability' :
    selectedCoverage?.tier === 'T1' ? 'Nearby availability' :
    selectedCoverage?.tier === 'T2' ? 'Area availability' :
    selectedCoverage?.tier === 'T3' || selectedCoverage?.tier === 'T4' ? 'Expanded availability' :
    selectedCoverage ? 'Coming soon' :
    'Coverage will be checked when you open the province';

  const SuburbList = ({ items, showProvince = false }) => (
    <>
      {items.map(s => {
        const key = `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`;
        const cov = coverageMap[key];
        const tierLabel =
          cov?.tier === 'T0' ? 'Local' :
          cov?.tier === 'T1' ? 'Nearby' :
          cov?.tier === 'T2' ? 'Area' :
          cov?.tier === 'T3' ? 'Regional' :
          cov?.tier === 'T4' ? 'National' :
          (!cov?.loading && cov && !cov.error) ? 'Coming soon' : null;
        return (
          <SuburbRow
            key={`${s.suburb}-${s.city}`}
            $active={isActive(s)}
            $selected={isSelected(s)}
            onClick={() => handleSelect(s)}
          >
            <SuburbIconWrap $active={isActive(s) || isSelected(s)}>
              <PinIcon />
            </SuburbIconWrap>
            <SuburbInfo>
              <SuburbName $active={isActive(s) || isSelected(s)}>{s.suburb}</SuburbName>
              <SuburbCity>{s.city}{showProvince ? ` · ${s.province}` : ''}</SuburbCity>
            </SuburbInfo>
            {cov?.loading && <CoverageLoadingDot />}
            {!cov?.loading && tierLabel && (
              <CoveragePill $tier={cov?.tier || 'none'}>{tierLabel}</CoveragePill>
            )}
            {(isActive(s) || isSelected(s)) && (
              <CheckCircle>
                <CheckSVGIcon />
              </CheckCircle>
            )}
          </SuburbRow>
        );
      })}
    </>
  );

  return (
    <>
      <Backdrop onClick={onClose} />
      <Sheet role="dialog" aria-modal="true" aria-label="Choose delivery area">
        <Handle />
        <Header>
          <div>
            <Title>
              {!isSearching && selectedProvince ? selectedProvince : 'Choose delivery area'}
            </Title>
            <HeaderCopy>Pick the area you want Shopply to use for nearby stock, delivery estimates, and seller availability.</HeaderCopy>
          </div>
          <CloseButton onClick={onClose} aria-label="Close">&#10005;</CloseButton>
        </Header>

        {!selectedProvince && !isSearching && (
          <HeroPanel>
            <HeroTitle>Find the closest furniture that is actually available.</HeroTitle>
            <HeroSub>Coverage is checked with the server for each area, so the home feed and search can adapt to your delivery location.</HeroSub>
            <MetricRow>
              <Metric>
                <MetricValue>{provinces.length}</MetricValue>
                <MetricLabel>provinces</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue>{SUBURBS.length}</MetricValue>
                <MetricLabel>delivery areas</MetricLabel>
              </Metric>
              <Metric>
                <MetricValue>{coveredProvinceCount || '--'}</MetricValue>
                <MetricLabel>with live stock</MetricLabel>
              </Metric>
            </MetricRow>
          </HeroPanel>
        )}

        {selectedArea && (
          <SelectedCard>
            <SelectedMark><PinIcon /></SelectedMark>
            <SelectedInfo>
              <SelectedTitle>{selectedArea.suburb}, {selectedArea.city}</SelectedTitle>
              <SelectedSub>{selectedArea.province || 'South Africa'} - {selectedCoverageLabel}</SelectedSub>
            </SelectedInfo>
            {selectedCoverage?.tier && <CoveragePill $tier={selectedCoverage.tier}>{selectedCoverage.count || 'A few'} items</CoveragePill>}
          </SelectedCard>
        )}

        {/* GPS coverage confirmation */}
        {gpsResult && (
          <GPSCoverageBox>
            <span style={{ fontSize: 18 }}>📍</span>
            <div style={{ flex: 1 }}>
              <GPSCoverageText>
                {gpsResult.suburb}, {gpsResult.city}
                {gpsCoverage?.nearestTier && (
                  <CoveragePill $tier={gpsCoverage.nearestTier} style={{ marginLeft: 6 }}>
                    {gpsCoverage.nearestTier === 'T0' ? 'Local' :
                     gpsCoverage.nearestTier === 'T1' ? 'Nearby' :
                     gpsCoverage.nearestTier === 'T2' ? 'Area' :
                     gpsCoverage.nearestTier === 'T3' ? 'Regional' : 'National'}
                  </CoveragePill>
                )}
              </GPSCoverageText>
              <GPSCoverageSub>
                {gpsCoverage?.nearestTier
                  ? `${gpsCoverage.estimatedResults || 'A few'} products found nearby`
                  : 'Shopply is still growing in your area'}
              </GPSCoverageSub>
            </div>
            <ConfirmButton onClick={handleConfirmGPS}>Use this</ConfirmButton>
          </GPSCoverageBox>
        )}

        {/* Recent locations */}
        {!isSearching && !selectedProvince && locationHistory.length > 0 && (
          <RecentSection>
            <SectionLabel>Recent</SectionLabel>
            {locationHistory.map((item, index) => (
              <RecentRow key={`${item.suburb}-${item.city}-${index}`} onClick={() => handleSelect(item)}>
                <RecentIconWrap>
                  <PinIcon />
                </RecentIconWrap>
                <RecentInfo>
                  <RecentSuburbName>{item.suburb}</RecentSuburbName>
                  <RecentSuburbSub>{item.city} · {item.province}</RecentSuburbSub>
                </RecentInfo>
                <RecentRemoveBtn
                  onClick={(e) => handleRemoveHistory(e, index)}
                  aria-label={`Remove ${item.suburb} from recent`}
                >
                  &#10005;
                </RecentRemoveBtn>
              </RecentRow>
            ))}
          </RecentSection>
        )}

        {!isSearching && !selectedProvince && <Divider />}

        {/* Breadcrumb when a province is selected */}
        {!isSearching && selectedProvince && (
          <ProvinceBreadcrumb>
            <ProvinceBreadcrumbBack
              onClick={() => setSelectedProvince(null)}
              aria-label="Back to provinces"
            >
              <BackChevronIcon />
            </ProvinceBreadcrumbBack>
            <ProvinceBreadcrumbLabel>{selectedProvince}</ProvinceBreadcrumbLabel>
            <ProvinceBreadcrumbCount>{provinceSuburbs.length} areas</ProvinceBreadcrumbCount>
          </ProvinceBreadcrumb>
        )}

        <ListWrap>
          {/* Search results */}
          {isSearching && (
            searchResults.length === 0 ? (
              <EmptyState>No areas found for &ldquo;{search}&rdquo;</EmptyState>
            ) : (
              <SuburbList items={searchResults} showProvince />
            )
          )}

          {/* Province grid */}
          {!isSearching && !selectedProvince && (
            <>
              <SectionLabel>Select your province</SectionLabel>
              <ProvinceGrid>
                {provinces.map(province => (
                  <ProvinceCard
                    key={province}
                    $active={isActiveProvince(province)}
                    onClick={() => setSelectedProvince(province)}
                  >
                    <ProvinceCoverageDot $tier={provinceCoverage[province]?.tier ?? null} />
                    <ProvinceIconCircle $active={isActiveProvince(province)}>
                      <MapRegionIcon />
                    </ProvinceIconCircle>
                    <ProvinceName $active={isActiveProvince(province)}>{province}</ProvinceName>
                    <ProvinceCount>
                      {(() => {
                        const cov = provinceCoverage[province];
                        if (!cov) return `${grouped[province].length} areas`;
                        if (!cov.tier || cov.count === 0) return 'Coming soon';
                        if (cov.tier === 'T0' || cov.tier === 'T1') return `${cov.count}+ items`;
                        if (cov.tier === 'T2') return `${cov.count}+ nearby`;
                        return 'Limited coverage';
                      })()}
                    </ProvinceCount>
                  </ProvinceCard>
                ))}
              </ProvinceGrid>
            </>
          )}

          {/* Suburb list for selected province */}
          {!isSearching && selectedProvince && (
            <SuburbList items={provinceSuburbs} />
          )}
        </ListWrap>

        <Footer>
          <FooterInfo>
            <FooterLabel>Selected area</FooterLabel>
            <FooterValue>
              {selectedArea ? `${selectedArea.suburb}, ${selectedArea.city}` : 'Choose an area to continue'}
            </FooterValue>
            {confirmError && <FooterError>{confirmError}</FooterError>}
          </FooterInfo>
          <ConfirmAreaButton
            type="button"
            $disabled={!selectedArea || confirming}
            disabled={!selectedArea || confirming}
            onClick={handleConfirmSelection}
          >
            {confirming ? 'Checking...' : 'Confirm area'}
          </ConfirmAreaButton>
        </Footer>
      </Sheet>
    </>
  );
};
