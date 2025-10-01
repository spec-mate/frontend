import React from "react";

export default function FilterSection({
  manufacturers,
  selectedManufacturer,
  setSelectedManufacturer,
  sortOption,
  setSortOption,
}) {
  return (
    <div className="filter-section">
      {/* 제조사 필터 */}
      <div className="filter-group">
        <label className="filter-label">제조사</label>
        <select
          value={selectedManufacturer}
          onChange={(e) => setSelectedManufacturer(e.target.value)}
          className="filter-select"
        >
          <option value="">전체</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 가격 정렬 */}
      <div className="filter-group">
        <label className="filter-label">정렬</label>
        <div className="filter-options">
          <label>
            <input
              type="radio"
              name="sort"
              value="priceAsc"
              checked={sortOption === "priceAsc"}
              onChange={(e) => setSortOption(e.target.value)}
            />
            낮은 가격순
          </label>
          <label>
            <input
              type="radio"
              name="sort"
              value="priceDesc"
              checked={sortOption === "priceDesc"}
              onChange={(e) => setSortOption(e.target.value)}
            />
            높은 가격순
          </label>
        </div>
      </div>
    </div>
  );
}
