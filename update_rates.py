import urllib.request
import json
import os

out_dir = r"C:\Users\ethan\Desktop\ChillVibez Studios\Currency-Converter-Android (v1.0.0)"

# Fetch latest rates from open API
url = "https://open.er-api.com/v6/latest/USD"
req = urllib.request.Request(url, headers={"User-Agent": "VibeFX-CurrencyConverter/1.0.0"})
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        live_data = json.loads(response.read().decode())
    live_rates = live_data.get("rates", {})
    update_time = live_data.get("time_last_update_utc", "Recent")
except Exception as e:
    print(f"Warning: Could not fetch live rates ({e}). Using embedded fallback.")
    live_rates = {}
    update_time = "Fallback Rates"

# Currencies metadata dictionary
# Format: code: (name, symbol, flag, region, is_popular)
CURRENCY_INFO = {
    "USD": ("US Dollar", "$", "🇺🇸", "americas", True),
    "EUR": ("Euro", "€", "🇪🇺", "europe", True),
    "GBP": ("British Pound", "£", "🇬🇧", "europe", True),
    "JPY": ("Japanese Yen", "¥", "🇯🇵", "asia", True),
    "CAD": ("Canadian Dollar", "CA$", "🇨🇦", "americas", True),
    "AUD": ("Australian Dollar", "A$", "🇦🇺", "asia", True),
    "CHF": ("Swiss Franc", "CHF", "🇨🇭", "europe", True),
    "CNY": ("Chinese Yuan", "¥", "🇨🇳", "asia", True),
    "INR": ("Indian Rupee", "₹", "🇮🇳", "asia", True),
    "MXN": ("Mexican Peso", "Mex$", "🇲🇽", "americas", True),
    "BRL": ("Brazilian Real", "R$", "🇧🇷", "americas", True),
    "KRW": ("South Korean Won", "₩", "🇰🇷", "asia", True),
    "SGD": ("Singapore Dollar", "S$", "🇸🇬", "asia", True),
    "NZD": ("New Zealand Dollar", "NZ$", "🇳🇿", "asia", False),
    "HKD": ("Hong Kong Dollar", "HK$", "🇭🇰", "asia", False),
    "NOK": ("Norwegian Krone", "kr", "🇳🇴", "europe", False),
    "SEK": ("Swedish Krona", "kr", "🇸🇪", "europe", False),
    "DKK": ("Danish Krone", "kr", "🇩🇰", "europe", False),
    "PLN": ("Polish Złoty", "zł", "🇵🇱", "europe", False),
    "TRY": ("Turkish Lira", "₺", "🇹🇷", "europe", False),
    "ZAR": ("South African Rand", "R", "🇿🇦", "africa", False),
    "THB": ("Thai Baht", "฿", "🇹🇭", "asia", True),
    "IDR": ("Indonesian Rupiah", "Rp", "🇮🇩", "asia", False),
    "MYR": ("Malaysian Ringgit", "RM", "🇲🇾", "asia", False),
    "PHP": ("Philippine Peso", "₱", "🇵🇭", "asia", True),
    "VND": ("Vietnamese Đồng", "₫", "🇻🇳", "asia", False),
    "AED": ("UAE Dirham", "AED", "🇦🇪", "middle-east", True),
    "SAR": ("Saudi Riyal", "SAR", "🇸🇦", "middle-east", False),
    "ILS": ("Israeli Shekel", "₪", "🇮🇱", "middle-east", False),
    "CLP": ("Chilean Peso", "CLP$", "🇨🇱", "americas", False),
    "COP": ("Colombian Peso", "COL$", "🇨🇴", "americas", False),
    "ARS": ("Argentine Peso", "ARS$", "🇦🇷", "americas", False),
    "EGP": ("Egyptian Pound", "E£", "🇪🇬", "africa", False),
    "NGN": ("Nigerian Naira", "₦", "🇳🇬", "africa", False),
    "KES": ("Kenyan Shilling", "KSh", "🇰🇪", "africa", False),
    "PKR": ("Pakistani Rupee", "₨", "🇵🇰", "asia", False),
    "BDT": ("Bangladeshi Taka", "৳", "🇧🇩", "asia", False),
    "TWD": ("New Taiwan Dollar", "NT$", "🇹🇼", "asia", False),
    "CZK": ("Czech Koruna", "Kč", "🇨🇿", "europe", False),
    "HUF": ("Hungarian Forint", "Ft", "🇭🇺", "europe", False),
    "RON": ("Romanian Leu", "lei", "🇷🇴", "europe", False),
    "BGN": ("Bulgarian Lev", "лв", "🇧🇬", "europe", False),
    "HRK": ("Croatian Kuna", "kn", "🇭🇷", "europe", False),
    "ISK": ("Icelandic Króna", "kr", "🇮🇸", "europe", False),
    "QAR": ("Qatari Riyal", "QR", "🇶🇦", "middle-east", False),
    "KWD": ("Kuwaiti Dinar", "KD", "🇰🇼", "middle-east", False),
    "BHD": ("Bahraini Dinar", "BD", "🇧🇭", "middle-east", False),
    "OMR": ("Omani Rial", "OMR", "🇴🇲", "middle-east", False),
    "JOD": ("Jordanian Dinar", "JD", "🇯🇴", "middle-east", False),
    "PEN": ("Peruvian Sol", "S/.", "🇵🇪", "americas", False),
    "UYU": ("Uruguayan Peso", "$U", "🇺🇾", "americas", False),
    "CRC": ("Costa Rican Colón", "₡", "🇨🇷", "americas", False),
    "DOP": ("Dominican Peso", "RD$", "🇩🇴", "americas", False),
    "GTQ": ("Guatemalan Quetzal", "Q", "🇬🇹", "americas", False),
    "UAH": ("Ukrainian Hryvnia", "₴", "🇺🇦", "europe", False),
    "KZT": ("Kazakhstani Tenge", "₸", "🇰🇿", "asia", False),
    "MAD": ("Moroccan Dirham", "MAD", "🇲🇦", "africa", False),
    "GHS": ("Ghanaian Cedi", "GH₵", "🇬🇭", "africa", False),
    "TZS": ("Tanzanian Shilling", "TSh", "🇹🇿", "africa", False),
    "UGX": ("Ugandan Shilling", "USh", "🇺🇬", "africa", False),
    "LKR": ("Sri Lankan Rupee", "Rs", "🇱🇰", "asia", False),
    "NPR": ("Nepalese Rupee", "रु", "🇳🇵", "asia", False),
    "BTC": ("Bitcoin", "₿", "🪙", "crypto", True),
    "ETH": ("Ethereum", "Ξ", "🪙", "crypto", True),
    "SOL": ("Solana", "◎", "🪙", "crypto", True),
}

# Default baseline fallback rates (USD base)
FALLBACK_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.77,
    "JPY": 152.4,
    "CAD": 1.39,
    "AUD": 1.51,
    "CHF": 0.86,
    "CNY": 7.12,
    "INR": 84.1,
    "MXN": 19.8,
    "BRL": 5.70,
    "KRW": 1380.0,
    "SGD": 1.32,
    "NZD": 1.66,
    "HKD": 7.77,
    "NOK": 10.95,
    "SEK": 10.60,
    "DKK": 6.88,
    "PLN": 4.01,
    "TRY": 34.25,
    "ZAR": 17.65,
    "THB": 33.75,
    "IDR": 15600.0,
    "MYR": 4.35,
    "PHP": 57.8,
    "VND": 25300.0,
    "AED": 3.6725,
    "SAR": 3.75,
    "ILS": 3.72,
    "CLP": 950.0,
    "COP": 4320.0,
    "ARS": 985.0,
    "EGP": 48.7,
    "NGN": 1650.0,
    "KES": 129.0,
    "PKR": 277.5,
    "BDT": 119.5,
    "TWD": 32.0,
    "CZK": 23.3,
    "HUF": 372.0,
    "RON": 4.58,
    "BGN": 1.80,
    "HRK": 6.95,
    "ISK": 137.5,
    "QAR": 3.64,
    "KWD": 0.307,
    "BHD": 0.376,
    "OMR": 0.384,
    "JOD": 0.709,
    "PEN": 3.76,
    "UYU": 41.5,
    "CRC": 512.0,
    "DOP": 60.2,
    "GTQ": 7.72,
    "UAH": 41.3,
    "KZT": 488.0,
    "MAD": 9.85,
    "GHS": 16.2,
    "TZS": 2720.0,
    "UGX": 3670.0,
    "LKR": 293.0,
    "NPR": 134.5,
    "BTC": 0.0000147,
    "ETH": 0.000385,
    "SOL": 0.00588,
}

# Combine live rates if available
final_rates = {}
for code, fallback in FALLBACK_RATES.items():
    if code in live_rates:
        final_rates[code] = live_rates[code]
    else:
        final_rates[code] = fallback

# If live rates returned other ISO currencies not explicitly in info, add them dynamically
for code, val in live_rates.items():
    if code not in final_rates and isinstance(val, (int, float)):
        final_rates[code] = val
        if code not in CURRENCY_INFO:
            CURRENCY_INFO[code] = (f"{code} Currency", code, "🌐", "other", False)

currency_list = []
for code, info in CURRENCY_INFO.items():
    currency_list.append({
        "code": code,
        "name": info[0],
        "symbol": info[1],
        "flag": info[2],
        "region": info[3],
        "popular": info[4],
        "rate": final_rates.get(code, 1.0)
    })

# Sort popular first, then alphabetically by code
currency_list.sort(key=lambda x: (not x["popular"], x["code"]))

js_content = f"""/**
 * VibeFX Currency Data (v1.0.0)
 * Comprehensive world currency database with offline fallback exchange rates.
 * Last baseline update: {update_time}
 */

export const BASELINE_RATES = {json.dumps(final_rates, indent=2)};

export const CURRENCIES = {json.dumps(currency_list, indent=2, ensure_ascii=False)};

export const DEFAULT_WATCHLIST = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'MXN'];
"""

out_file = os.path.join(out_dir, "currencies.js")
with open(out_file, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated currencies.js with {len(currency_list)} currencies and fallback rates!")
