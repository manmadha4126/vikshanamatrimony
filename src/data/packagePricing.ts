// Country-based pricing for subscription packages

export interface CountryPricing {
  currency: string;
  currencySymbol: string;
  basic: {
    gold: Record<string, number>;
    prime_gold: Record<string, number>;
  };
  combo: {
    combo: Record<string, number>;
    prime_combo: Record<string, number>;
  };
  assisted: {
    assisted_gold: Record<string, number>;
    assisted_prime: Record<string, number>;
    assisted_supreme: Record<string, number>;
  };
}

export const packagePricingByCountry: Record<string, CountryPricing> = {
  "India": {
    currency: "INR",
    currencySymbol: "₹",
    basic: {
      gold: {
        '1_month': 2000,
        '3_months': 5000,
        '6_months': 6500,
        '1_year': 8000
      },
      prime_gold: {
        '1_month': 3000,
        '3_months': 6000,
        '6_months': 7500,
        '1_year': 9500
      }
    },
    combo: {
      combo: {
        '1_month': 2500,
        '3_months': 6000,
        '6_months': 7500,
        '1_year': 9500
      },
      prime_combo: {
        '1_month': 3500,
        '3_months': 7500,
        '6_months': 8500,
        '1_year': 10000
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 15000,
        '3_months': 25000,
        '6_months': 40000,
        '1_year': 80000
      },
      assisted_prime: {
        '1_month': 30000,
        '3_months': 35000,
        '6_months': 42000,
        '1_year': 69000
      },
      assisted_supreme: {
        '1_month': 35000,
        '3_months': 41900,
        '6_months': 52200,
        '1_year': 90000
      }
    }
  },
  "United States": {
    currency: "USD",
    currencySymbol: "$",
    basic: {
      gold: {
        '1_month': 50,
        '3_months': 120,
        '6_months': 180,
        '1_year': 250
      },
      prime_gold: {
        '1_month': 75,
        '3_months': 180,
        '6_months': 250,
        '1_year': 350
      }
    },
    combo: {
      combo: {
        '1_month': 65,
        '3_months': 150,
        '6_months': 220,
        '1_year': 300
      },
      prime_combo: {
        '1_month': 90,
        '3_months': 200,
        '6_months': 280,
        '1_year': 380
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 350,
        '3_months': 600,
        '6_months': 950,
        '1_year': 1800
      },
      assisted_prime: {
        '1_month': 650,
        '3_months': 800,
        '6_months': 1000,
        '1_year': 1600
      },
      assisted_supreme: {
        '1_month': 800,
        '3_months': 1000,
        '6_months': 1250,
        '1_year': 2100
      }
    }
  },
  "United Kingdom": {
    currency: "GBP",
    currencySymbol: "£",
    basic: {
      gold: {
        '1_month': 40,
        '3_months': 100,
        '6_months': 150,
        '1_year': 200
      },
      prime_gold: {
        '1_month': 60,
        '3_months': 150,
        '6_months': 200,
        '1_year': 280
      }
    },
    combo: {
      combo: {
        '1_month': 55,
        '3_months': 125,
        '6_months': 180,
        '1_year': 250
      },
      prime_combo: {
        '1_month': 75,
        '3_months': 170,
        '6_months': 230,
        '1_year': 320
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 300,
        '3_months': 500,
        '6_months': 800,
        '1_year': 1500
      },
      assisted_prime: {
        '1_month': 550,
        '3_months': 680,
        '6_months': 850,
        '1_year': 1350
      },
      assisted_supreme: {
        '1_month': 680,
        '3_months': 850,
        '6_months': 1050,
        '1_year': 1800
      }
    }
  },
  "United Arab Emirates": {
    currency: "AED",
    currencySymbol: "د.إ",
    basic: {
      gold: {
        '1_month': 180,
        '3_months': 450,
        '6_months': 650,
        '1_year': 900
      },
      prime_gold: {
        '1_month': 275,
        '3_months': 650,
        '6_months': 900,
        '1_year': 1250
      }
    },
    combo: {
      combo: {
        '1_month': 240,
        '3_months': 550,
        '6_months': 800,
        '1_year': 1100
      },
      prime_combo: {
        '1_month': 330,
        '3_months': 730,
        '6_months': 1000,
        '1_year': 1400
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 1300,
        '3_months': 2200,
        '6_months': 3500,
        '1_year': 6600
      },
      assisted_prime: {
        '1_month': 2400,
        '3_months': 2900,
        '6_months': 3600,
        '1_year': 5800
      },
      assisted_supreme: {
        '1_month': 2900,
        '3_months': 3650,
        '6_months': 4550,
        '1_year': 7700
      }
    }
  },
  "Canada": {
    currency: "CAD",
    currencySymbol: "C$",
    basic: {
      gold: {
        '1_month': 65,
        '3_months': 160,
        '6_months': 240,
        '1_year': 330
      },
      prime_gold: {
        '1_month': 100,
        '3_months': 240,
        '6_months': 330,
        '1_year': 470
      }
    },
    combo: {
      combo: {
        '1_month': 85,
        '3_months': 200,
        '6_months': 290,
        '1_year': 400
      },
      prime_combo: {
        '1_month': 120,
        '3_months': 265,
        '6_months': 370,
        '1_year': 500
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 470,
        '3_months': 800,
        '6_months': 1250,
        '1_year': 2400
      },
      assisted_prime: {
        '1_month': 870,
        '3_months': 1070,
        '6_months': 1330,
        '1_year': 2130
      },
      assisted_supreme: {
        '1_month': 1070,
        '3_months': 1330,
        '6_months': 1670,
        '1_year': 2800
      }
    }
  },
  "Australia": {
    currency: "AUD",
    currencySymbol: "A$",
    basic: {
      gold: {
        '1_month': 75,
        '3_months': 185,
        '6_months': 270,
        '1_year': 380
      },
      prime_gold: {
        '1_month': 115,
        '3_months': 275,
        '6_months': 380,
        '1_year': 530
      }
    },
    combo: {
      combo: {
        '1_month': 100,
        '3_months': 230,
        '6_months': 330,
        '1_year': 460
      },
      prime_combo: {
        '1_month': 140,
        '3_months': 305,
        '6_months': 425,
        '1_year': 580
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 540,
        '3_months': 920,
        '6_months': 1450,
        '1_year': 2750
      },
      assisted_prime: {
        '1_month': 1000,
        '3_months': 1230,
        '6_months': 1530,
        '1_year': 2450
      },
      assisted_supreme: {
        '1_month': 1230,
        '3_months': 1530,
        '6_months': 1920,
        '1_year': 3230
      }
    }
  },
  "Singapore": {
    currency: "SGD",
    currencySymbol: "S$",
    basic: {
      gold: {
        '1_month': 65,
        '3_months': 160,
        '6_months': 240,
        '1_year': 330
      },
      prime_gold: {
        '1_month': 100,
        '3_months': 240,
        '6_months': 330,
        '1_year': 470
      }
    },
    combo: {
      combo: {
        '1_month': 85,
        '3_months': 200,
        '6_months': 290,
        '1_year': 400
      },
      prime_combo: {
        '1_month': 120,
        '3_months': 265,
        '6_months': 370,
        '1_year': 500
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 470,
        '3_months': 800,
        '6_months': 1250,
        '1_year': 2400
      },
      assisted_prime: {
        '1_month': 870,
        '3_months': 1070,
        '6_months': 1330,
        '1_year': 2130
      },
      assisted_supreme: {
        '1_month': 1070,
        '3_months': 1330,
        '6_months': 1670,
        '1_year': 2800
      }
    }
  },
  "Malaysia": {
    currency: "MYR",
    currencySymbol: "RM",
    basic: {
      gold: {
        '1_month': 220,
        '3_months': 550,
        '6_months': 800,
        '1_year': 1100
      },
      prime_gold: {
        '1_month': 330,
        '3_months': 800,
        '6_months': 1100,
        '1_year': 1550
      }
    },
    combo: {
      combo: {
        '1_month': 290,
        '3_months': 680,
        '6_months': 980,
        '1_year': 1350
      },
      prime_combo: {
        '1_month': 400,
        '3_months': 890,
        '6_months': 1220,
        '1_year': 1700
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 1600,
        '3_months': 2700,
        '6_months': 4300,
        '1_year': 8100
      },
      assisted_prime: {
        '1_month': 2950,
        '3_months': 3600,
        '6_months': 4450,
        '1_year': 7150
      },
      assisted_supreme: {
        '1_month': 3600,
        '3_months': 4450,
        '6_months': 5600,
        '1_year': 9400
      }
    }
  },
  "Germany": {
    currency: "EUR",
    currencySymbol: "€",
    basic: {
      gold: {
        '1_month': 45,
        '3_months': 110,
        '6_months': 165,
        '1_year': 230
      },
      prime_gold: {
        '1_month': 70,
        '3_months': 165,
        '6_months': 230,
        '1_year': 320
      }
    },
    combo: {
      combo: {
        '1_month': 60,
        '3_months': 140,
        '6_months': 200,
        '1_year': 280
      },
      prime_combo: {
        '1_month': 85,
        '3_months': 185,
        '6_months': 260,
        '1_year': 360
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 330,
        '3_months': 560,
        '6_months': 880,
        '1_year': 1670
      },
      assisted_prime: {
        '1_month': 610,
        '3_months': 750,
        '6_months': 940,
        '1_year': 1500
      },
      assisted_supreme: {
        '1_month': 750,
        '3_months': 940,
        '6_months': 1170,
        '1_year': 1970
      }
    }
  },
  "New Zealand": {
    currency: "NZD",
    currencySymbol: "NZ$",
    basic: {
      gold: {
        '1_month': 80,
        '3_months': 200,
        '6_months': 295,
        '1_year': 410
      },
      prime_gold: {
        '1_month': 125,
        '3_months': 300,
        '6_months': 410,
        '1_year': 580
      }
    },
    combo: {
      combo: {
        '1_month': 105,
        '3_months': 250,
        '6_months': 360,
        '1_year': 500
      },
      prime_combo: {
        '1_month': 150,
        '3_months': 330,
        '6_months': 460,
        '1_year': 630
      }
    },
    assisted: {
      assisted_gold: {
        '1_month': 580,
        '3_months': 1000,
        '6_months': 1580,
        '1_year': 3000
      },
      assisted_prime: {
        '1_month': 1090,
        '3_months': 1340,
        '6_months': 1670,
        '1_year': 2670
      },
      assisted_supreme: {
        '1_month': 1340,
        '3_months': 1670,
        '6_months': 2100,
        '1_year': 3520
      }
    }
  }
};

// Get pricing for a specific country (defaults to India if not found)
export const getPricingForCountry = (country: string | null): CountryPricing => {
  if (!country || !packagePricingByCountry[country]) {
    return packagePricingByCountry["India"];
  }
  return packagePricingByCountry[country];
};

// Format price based on currency
export const formatPriceWithCurrency = (price: number, currency: string, currencySymbol: string): string => {
  if (currency === "INR") {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  return `${currencySymbol}${price.toLocaleString()}`;
};
