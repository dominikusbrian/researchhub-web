import { Hub } from "~/config/types/hub";
import Select, { ValueType, OptionTypeBase, components } from "react-select";
import HubCard from "./HubCard";
import FormSelect from "../Form/FormSelect";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
import { fetchHubSuggestions } from "../SearchSuggestion/lib/api";
import { HubSuggestion } from "../SearchSuggestion/lib/types";
import { css, StyleSheet } from "aphrodite";
import colors from "~/config/themes/colors";
import HubTag from "./HubTag";

interface Props {
  selectedHubs?: Hub[];
  onChange: Function;
  menuPlacement?: "auto" | "top" | "bottom";
  required?: boolean;
  isMulti?: boolean;
  label?: string | null;
  placeholder?: any;
  dropdownStyles?: any;
  containerStyle?: any;
  showSelectedHubs?: boolean;
  showCountInsteadOfLabels?: boolean;
  error?: string | null;
}

export const selectDropdownStyles = {
  multiTagLabelStyle: {
    color: colors.NEW_BLUE(1),
    cursor: "pointer",
  },
  multiTagStyle: {
    border: 0,
    background: colors.NEW_BLUE(0.1),
    padding: "4px 12px",
    height: "unset",
    textDecoration: "none",
    fontWeight: 400,
    borderRadius: 50,
    color: colors.NEW_BLUE(),
  },
  option: {
    width: "auto",
    boxSizing: "border-box",
    textAlign: "center",
    backgroundColor: "unset",
    padding: 0,
    marginTop: 0,
    marginBottom: 8,
    ":nth-child(3n+1)": {
      paddingLeft: 5,
    },
    ":hover": {
      backgroundColor: "unset",
    },
  },
  menuList: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "10px",
    padding: "7px 7px 0 7px",
  },
  valueContainer: {
    padding: "7px 7px 7px 4px",
  },
};

const TagOnlyOption: React.FC<any> = (props) => {
  return (
    <components.Option {...props}>
      <HubTag
        overrideStyle={formStyles.tagStyle}
        hub={props.data.hub}
        preventLinkClick={true}
      />
    </components.Option>
  );
};

const HubSelectDropdown = ({
  selectedHubs = [],
  onChange,
  menuPlacement = "auto",
  required = false,
  isMulti = true,
  label = "Hubs",
  placeholder = "Search hubs",
  dropdownStyles = selectDropdownStyles,
  showSelectedHubs = true,
  showCountInsteadOfLabels = false,
  error = null,
}: Props) => {
  const [suggestedHubs, setSuggestedHubs] = useState<HubSuggestion[]>([]);

  const handleHubInputChange = async (value) => {
    if (value.length >= 3) {
      const suggestions = await fetchHubSuggestions({ query: value });
      setSuggestedHubs(suggestions);
    }
  };

  const debouncedHandleInputChange = useCallback(
    debounce(handleHubInputChange, 250),
    [suggestedHubs]
  );

  const formattedSelectedHubs = selectedHubs.map((h) => ({
    label: h.name,
    value: h.id,
  }));

  return (
    <div>
      <FormSelect
        containerStyle={formStyles.container}
        id="hubs"
        isMulti={isMulti}
        label={label}
        showCountInsteadOfLabels={showCountInsteadOfLabels}
        required={required}
        reactStyles={{}}
        inputStyle={formStyles.inputStyle}
        reactSelect={{ 
          styles: {
            ...dropdownStyles,
            control: (base, state) => ({
              ...base,
              borderColor: error ? colors.RED() : base.borderColor,
              '&:hover': {
                borderColor: error ? colors.RED() : base.borderColor,
              }
            })
          } 
        }}
        error={error}
        noOptionsMessage={(value) => {
          return value.inputValue.length >= 3
            ? "No hubs found"
            : "Type to search hubs";
        }}
        onInputChange={(field, value) => {
          debouncedHandleInputChange(field, value);
        }}
        onChange={(name, values) => {
          const _values = isMulti ? values : [values];

          const allAvailableHubs = suggestedHubs
            .map((suggestion) => suggestion.hub)
            .concat(selectedHubs);
          const newHubs = (_values || [])
            .map((v) => allAvailableHubs.find((h) => h.id === v.value))
            .filter((h) => ![undefined, null].includes(h));

          onChange(newHubs);
        }}
        selectComponents={{
          Option: TagOnlyOption,
          IndicatorsContainer: () => null,
        }}
        menu={{
          display: "flex",
          flexWrap: "wrap",
        }}
        options={suggestedHubs}
        placeholder={placeholder}
        value={formattedSelectedHubs}
        menuPlacement={menuPlacement}
      />
    </div>
  );
};

const formStyles = StyleSheet.create({
  hubCardStyle: {
    fontSize: 14,
    border: 0,
    borderLeft: "unset",
    textAlign: "left",
    padding: 8,
    paddingBottom: 0,
    height: "auto",
  },
  tagStyle: {
    fontSize: 13,
  },
  hubDescriptionStyle: {
    height: 70,
    fontSize: 12,
    marginTop: 10,
    lineHeight: "1.25em",
  },
  metadataStyle: {
    paddingBottom: 0,
  },
  container: {
    minHeight: "auto",
  },
  inputStyle: {},
  formWrapper: {
    width: "100%",
  },
  error: {
    margin: 0,
    padding: 0,
    marginTop: 4,
    marginBottom: 10,
    color: colors.RED(1),
    fontSize: 12,
  },
});

export default HubSelectDropdown;
