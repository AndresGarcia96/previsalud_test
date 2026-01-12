"use client";

import React, { useRef, useState } from "react";

import type {
  InputRef,
  TableColumnsType,
  TableColumnType,
  TableProps,
} from "antd";
import { Button, Col, Input, Row, Space, Table } from "antd";
import { FaFilterCircleXmark } from "react-icons/fa6";
import { FaSort } from "react-icons/fa";
import { LuListRestart } from "react-icons/lu";
import { VscDebugRestart } from "react-icons/vsc";
import { FaSearch } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import Highlighter from "react-highlight-words";
import CustomSpin from "../custom_spin/CustomSpin";

type GetSingle<T> = T extends (infer U)[] ? U : never;

type OnChange = NonNullable<TableProps<any>["onChange"]>;
type Filters = Parameters<OnChange>[1];
type Sorts = GetSingle<Parameters<OnChange>[2]>;

interface ColumnConfig<T> {
  title: string;
  key: string;
  dataIndex: string;
  width: string | number;
  filters?: { text: string; value: React.Key }[];
  onFilter?: (value: boolean | React.Key, record: T) => boolean;
  sorter?: (a: T, b: T) => number;
  searchable?: boolean;
  fixed?: boolean | "left" | "right";
}

const CustomTableFiltersAndSorting: React.FC<{
  dataCustomTable: any[];
  columnsCustomTable: ColumnConfig<any>[];
  onClickUpdateCustomTable: () => void;
  isLoading: boolean;
}> = ({
  dataCustomTable,
  columnsCustomTable,
  onClickUpdateCustomTable,
  isLoading,
}) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);

  const [filteredInfo, setFilteredInfo] = useState<Filters>({});
  const [sortedInfo, setSortedInfo] = useState<Sorts>({});

  const [pageSize, setPageSize] = useState(10);

  const handleChange: OnChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as Sorts);
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearSorting = () => {
    setSortedInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
    handleReset(clearFilters);
  };

  const handlePageSizeChange = (current: number, size: number) => {
    setPageSize(size);
  };

  const getColumnSearchProps = (dataIndex: string): TableColumnType<any> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          display: "flex",
          flexFlow: "column wrap",
          width: "231px",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          padding: "13px",
          margin: "0px",
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Buscar en columna`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ display: "block", marginBottom: "13px", padding: "8px" }}
        />

        <Space
          direction="vertical"
          size={"small"}
          style={{
            width: "100%",
          }}
        >
          <Col
            style={{
              display: "flex",
              flexFlow: "row wrap",
              justifyContent: "space-evenly",
              alignContent: "center",
              alignItems: "center",
              paddingBottom: "7px",
              margin: "0px",
            }}
          >
            <Button
              onClick={() =>
                handleSearch(selectedKeys as string[], confirm, dataIndex)
              }
              icon={<FaSearch />}
              size="middle"
              style={{
                width: "45%",
                backgroundColor: "#015E90",
                color: "#F7F7F7",
                borderRadius: 22,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                marginInline: "2px",
              }}
            >
              Buscar
            </Button>

            <Button
              onClick={() => clearFilters && handleReset(clearFilters)}
              icon={<VscDebugRestart />}
              size="middle"
              style={{
                width: "45%",
                color: "#137A2B",
                borderColor: "#137A2B",
                borderRadius: 22,
                borderWidth: 1.3,
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                marginInline: "2px",
              }}
            >
              Reiniciar
            </Button>
          </Col>

          <Button
            size="middle"
            style={{
              width: "100%",
              color: "#015E90",
              borderColor: "#015E90",
              borderRadius: 22,
              borderWidth: 0.7,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: "7px",
              marginBottom: "7px",
            }}
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filtrar
          </Button>
          <Button
            size="middle"
            style={{
              width: "100%",
              color: "#960202",
              fontWeight: "bold",
              borderColor: "#960202",
              borderRadius: 22,
              borderWidth: 1.3,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: "7px",
              marginBottom: "7px",
            }}
            onClick={() => close()}
          >
            Cerrar
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <FaSearch style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 22);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#F4D03F", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: TableColumnsType<any> = columnsCustomTable.map((col) => {
    const column = {
      ...col,
      filteredValue: filteredInfo[col.key] || null,
      sortOrder: sortedInfo.columnKey === col.key ? sortedInfo.order : null,
      ellipsis: true,
    };

    if (col.searchable) {
      Object.assign(column, getColumnSearchProps(col.dataIndex));
    }

    if (col.fixed) {
      column.fixed = col.fixed;
    }

    return column;
  });

  return (
    <>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          paddingBlock: "7px",
        }}
      >
        <Space direction="horizontal" size={"small"}>
          <Button
            style={{
              display: "flex",
              flexFlow: "row wrap",
              color: "#015E90",
              borderColor: "#015E90",
              fontWeight: "bold",
              borderRadius: 22,
              borderWidth: 1.3,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: 13,
              paddingBlock: 7,
            }}
            size="small"
            icon={<FaFilterCircleXmark />}
            onClick={clearFilters}
          >
            Quitar fil.
          </Button>
          <Button
            style={{
              display: "flex",
              flexFlow: "row wrap",
              color: "#015E90",
              borderColor: "#015E90",
              fontWeight: "bold",
              borderRadius: 22,
              borderWidth: 1.3,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: 13,
              paddingBlock: 7,
            }}
            size="small"
            icon={<FaSort />}
            onClick={clearSorting}
          >
            Quitar orde.
          </Button>
          <Button
            style={{
              display: "flex",
              flexFlow: "row wrap",
              color: "#960202",
              borderColor: "#960202",
              fontWeight: "bold",
              borderRadius: 22,
              borderWidth: 1.3,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: 13,
              paddingBlock: 7,
            }}
            size="small"
            icon={<LuListRestart />}
            onClick={clearAll}
          >
            Quitar todo
          </Button>

          <Button
            style={{
              display: "flex",
              flexFlow: "row wrap",
              color: "#137A2B",
              borderColor: "#1D8348",
              fontWeight: "bold",
              borderRadius: 22,
              borderWidth: 1.3,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              paddingInline: 13,
              paddingBlock: 7,
              marginLeft: 31,
            }}
            size="small"
            icon={<MdRefresh size={20} />}
            onClick={onClickUpdateCustomTable}
          >
            Actualizar
          </Button>
        </Space>
      </div>

      <Table
        size="small"
        style={{
          width: "540px",
          minWidth: "100%",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          padding: "0px",
          marginBlock: "13px",
        }}
        scroll={{
          x: "min-content",
          scrollToFirstRowOnChange: true,
        }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={dataCustomTable}
        onChange={handleChange}
        loading={{
          spinning: isLoading,
          indicator: <CustomSpin />,
        }}
        footer={undefined}
        pagination={{
          pageSize: pageSize,
          size: "default",
          position: ["bottomCenter"],
          showQuickJumper: true,
          showSizeChanger: true,
          onShowSizeChange: handlePageSizeChange,
          pageSizeOptions: [10, 20, 30, 50, 100, 200, 300],
          style: {
            margin: "0px",
            paddingTop: "13px",
          },
        }}
        bordered
      />
    </>
  );
};

export default CustomTableFiltersAndSorting;
