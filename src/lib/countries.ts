export type CountryOption = {
  code: string;
  name: string;
  callingCode: string;
};

const DATA: Array<[string, string]> = [
  ["ZA","+27"],["MZ","+258"],["AO","+244"],["BW","+267"],["NA","+264"],
  ["ZW","+263"],["ZM","+260"],["MW","+265"],["TZ","+255"],["KE","+254"],
  ["UG","+256"],["GH","+233"],["NG","+234"],["MA","+212"],["EG","+20"],
  ["FR","+33"],["PT","+351"],["ES","+34"],["GB","+44"],["DE","+49"],
  ["IT","+39"],["BR","+55"],["US","+1"],["CA","+1"],["MX","+52"],
  ["IN","+91"],["CN","+86"],["JP","+81"],["AU","+61"],["NZ","+64"],
  ["AE","+971"],["SA","+966"],["TR","+90"],["RU","+7"],["PK","+92"],
  ["BD","+880"],["ID","+62"],["PH","+63"],["SG","+65"],["CH","+41"],
  ["NL","+31"],["BE","+32"],["SE","+46"],["NO","+47"],["DK","+45"],
  ["FI","+358"],["PL","+48"],["GR","+30"],["RO","+40"],["UA","+380"],
  ["IL","+972"],["AR","+54"],["CL","+56"],["CO","+57"],["PE","+51"],
  ["UY","+598"],["PY","+595"],["CR","+506"],["PA","+507"],["DO","+1"],
  ["JM","+1"],["HT","+509"],["CU","+53"],["KZ","+7"],["GE","+995"],
  ["SN","+221"],["CI","+225"],["CM","+237"],["ET","+251"],["RW","+250"],
  ["BI","+257"],["CD","+243"],["CG","+242"],["TG","+228"],["BJ","+229"],
  ["ML","+223"],["BF","+226"],["NE","+227"],["SL","+232"],["LR","+231"],
  ["GM","+220"],["GN","+224"],["CV","+238"],["MR","+222"],["DZ","+213"],
  ["TN","+216"],["LY","+218"],["SD","+249"],["SS","+211"],["SO","+252"],
  ["DJ","+253"],["ER","+291"],["FJ","+679"],["TH","+66"],["VN","+84"],
  ["MY","+60"],["KR","+82"],["TW","+886"],["HK","+852"],["LK","+94"],
  ["NP","+977"],["IR","+98"],["IQ","+964"],["JO","+962"],["LB","+961"],
  ["QA","+974"],["KW","+965"],["BH","+973"],["OM","+968"]
];

const names =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

export const COUNTRIES: CountryOption[] = DATA
  .map(([code, callingCode]) => ({
    code,
    callingCode,
    name: names?.of(code) || code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function getCountry(code: string) {
  return COUNTRIES.find((country) => country.code === code);
}

export function composeE164(callingCode: string, number: string) {
  const digits = number.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? callingCode + digits : "";
}
