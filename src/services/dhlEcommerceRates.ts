// src/constants/dhlEcommerceRates.ts

// Interface for DHL eCommerce rate slab
export interface DHLEcommerceRateSlab {
  dhlEcommerceDomesticRateListID: number
  min_weight_kg: string
  max_weight_kg: string
  bkk_charge_thb: string
  upc_charge_thb: string
}

// Default DHL eCommerce domestic rate slabs (fallback when API fails)
export const DEFAULT_DHL_RATE_SLABS: DHLEcommerceRateSlab[] = [
  { dhlEcommerceDomesticRateListID: 1, min_weight_kg: '0',      max_weight_kg: '0.25',  bkk_charge_thb: '37',  upc_charge_thb: '47' },
  { dhlEcommerceDomesticRateListID: 2, min_weight_kg: '0.251',  max_weight_kg: '0.5',   bkk_charge_thb: '37',  upc_charge_thb: '47' },
  { dhlEcommerceDomesticRateListID: 3, min_weight_kg: '0.501',  max_weight_kg: '0.75',  bkk_charge_thb: '37',  upc_charge_thb: '57' },
  { dhlEcommerceDomesticRateListID: 4, min_weight_kg: '0.751',  max_weight_kg: '1',    bkk_charge_thb: '37',  upc_charge_thb: '62' },
  { dhlEcommerceDomesticRateListID: 5, min_weight_kg: '1.001',  max_weight_kg: '1.5',  bkk_charge_thb: '77',  upc_charge_thb: '87' },
  { dhlEcommerceDomesticRateListID: 6, min_weight_kg: '1.501',  max_weight_kg: '2',    bkk_charge_thb: '77',  upc_charge_thb: '97' },
  { dhlEcommerceDomesticRateListID: 7, min_weight_kg: '2.001',  max_weight_kg: '3',    bkk_charge_thb: '87',  upc_charge_thb: '122' },
  { dhlEcommerceDomesticRateListID: 8, min_weight_kg: '3.001',  max_weight_kg: '4',    bkk_charge_thb: '97',  upc_charge_thb: '132' },
  { dhlEcommerceDomesticRateListID: 9, min_weight_kg: '4.001',  max_weight_kg: '5',    bkk_charge_thb: '97',  upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 10, min_weight_kg: '5.001', max_weight_kg: '6',   bkk_charge_thb: '128', upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 11, min_weight_kg: '6.001', max_weight_kg: '7',   bkk_charge_thb: '128', upc_charge_thb: '142' },
  { dhlEcommerceDomesticRateListID: 12, min_weight_kg: '7.001', max_weight_kg: '8',   bkk_charge_thb: '128', upc_charge_thb: '153' },
  { dhlEcommerceDomesticRateListID: 13, min_weight_kg: '8.001', max_weight_kg: '9',   bkk_charge_thb: '140', upc_charge_thb: '182' },
  { dhlEcommerceDomesticRateListID: 14, min_weight_kg: '9.001', max_weight_kg: '10',  bkk_charge_thb: '149', upc_charge_thb: '197' },
  { dhlEcommerceDomesticRateListID: 15, min_weight_kg: '10.001',max_weight_kg: '11',  bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 16, min_weight_kg: '11.001',max_weight_kg: '12',  bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 17, min_weight_kg: '12.001',max_weight_kg: '13',  bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 18, min_weight_kg: '13.001',max_weight_kg: '14',  bkk_charge_thb: '169', upc_charge_thb: '187' },
  { dhlEcommerceDomesticRateListID: 19, min_weight_kg: '14.001',max_weight_kg: '15',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 20, min_weight_kg: '15.001',max_weight_kg: '16',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 21, min_weight_kg: '16.001',max_weight_kg: '17',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 22, min_weight_kg: '17.001',max_weight_kg: '18',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 23, min_weight_kg: '18.001',max_weight_kg: '19',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 24, min_weight_kg: '19.001',max_weight_kg: '20',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 25, min_weight_kg: '20.001',max_weight_kg: '21',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 26, min_weight_kg: '21.001',max_weight_kg: '22',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 27, min_weight_kg: '22.001',max_weight_kg: '23',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 28, min_weight_kg: '23.001',max_weight_kg: '24',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 29, min_weight_kg: '24.001',max_weight_kg: '25',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 30, min_weight_kg: '25.001',max_weight_kg: '26',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 31, min_weight_kg: '26.001',max_weight_kg: '27',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 32, min_weight_kg: '27.001',max_weight_kg: '28',  bkk_charge_thb: '249', upc_charge_thb: '283' },
  { dhlEcommerceDomesticRateListID: 33, min_weight_kg: '28.001',max_weight_kg: '29',  bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 34, min_weight_kg: '29.001',max_weight_kg: '30',  bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 35, min_weight_kg: '30.001',max_weight_kg: '31',  bkk_charge_thb: '325', upc_charge_thb: '359' },
  { dhlEcommerceDomesticRateListID: 36, min_weight_kg: '31.001',max_weight_kg: '32',  bkk_charge_thb: '350', upc_charge_thb: '384' },
  { dhlEcommerceDomesticRateListID: 37, min_weight_kg: '32.001',max_weight_kg: '33',  bkk_charge_thb: '375', upc_charge_thb: '409' },
  { dhlEcommerceDomesticRateListID: 38, min_weight_kg: '33.001',max_weight_kg: '34',  bkk_charge_thb: '400', upc_charge_thb: '434' },
  { dhlEcommerceDomesticRateListID: 39, min_weight_kg: '34.001',max_weight_kg: '35',  bkk_charge_thb: '425', upc_charge_thb: '459' }
]
