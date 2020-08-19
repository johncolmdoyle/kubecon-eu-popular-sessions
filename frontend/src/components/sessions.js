import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import paginationFactory, { PaginationProvider, PaginationListStandalone } from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

const Sessions = ({ sessions }) => {
  const { SearchBar } = Search;

  const columns = [{
      dataField: 'id',
      text: 'Session Name'
    }, {
      dataField: 'views',
      text: 'Views'
    }, {
      dataField: 'track',
      text: 'Track'
  }];

  const options = {
    custom: true,
    totalSize: sessions.length,
    paginationSize: 4,
    pageStartIndex: 1,
    firstPageText: 'First',
    prePageText: 'Back',
    nextPageText: 'Next',
    lastPageText: 'Last',
    nextPageTitle: 'First page',
    prePageTitle: 'Pre page',
    firstPageTitle: 'Next page',
    lastPageTitle: 'Last page',
    showTotal: true,
  };

  const contentTable = ({ paginationProps, paginationTableProps }) => (
      <div>
        <PaginationListStandalone { ...paginationProps } />
        <ToolkitProvider
          keyField="id"
          columns={ columns }
          data={ sessions }
          search
        >
          {
            toolkitprops => (
              <div>
                <SearchBar { ...toolkitprops.searchProps } />
                <BootstrapTable
                  striped
                  hover
                  { ...toolkitprops.baseProps }
                  { ...paginationTableProps }
                />
              </div>
            )
          }
        </ToolkitProvider>
        <PaginationListStandalone { ...paginationProps } />
      </div>
    );

  return (
      <div>
        <PaginationProvider
          pagination={
            paginationFactory(options)
          }
        >
          { contentTable }
        </PaginationProvider>
      </div >
    );
};

export default Sessions
