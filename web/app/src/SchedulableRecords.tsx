import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { debounce } from 'lodash';
import * as React from 'react';

import Execution from './Execution';
import { IGlobalWindow, ISchedulableRecordsProps, ISchedulableRecordsStates } from './interfaces';
import SchedulableRecord from './SchedulableRecord';
import SchedulableRecordTableCell from './SchedulableRecordTableCell';

declare var window: IGlobalWindow;

class SchedulableRecords extends React.Component<ISchedulableRecordsProps, ISchedulableRecordsStates> {
  private fetchLoop: ReturnType<typeof setTimeout>;
  private executionFetchLoop: ReturnType<typeof setTimeout>;

  private handleTimeRangeFilterChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(event.target.value, 10);
    if (isNaN(inputValue)) {
       return;
    }
    this.setState({timeRangeMinute: inputValue});
    this.fetchSchedulableRecord();
  }, 500)

  constructor(props: ISchedulableRecordsProps) {
    super(props);

    this.state = {records: [], timeRangeMinute: 10, executions: []};
  }

  public componentDidMount() {
    this.fetchSchedulableRecord();
    this.setFetchSchedulableRecordLoop();
    this.fetchExecution();
    this.setFetchExecutionLoop();
  }

  public componentWillUnmount() {
    if (this.fetchLoop) {
      clearTimeout(this.fetchLoop);
    }

    if (this.executionFetchLoop) {
      clearTimeout(this.executionFetchLoop);
    }
  }

  public setFetchSchedulableRecordLoop(): void {
    this.fetchLoop = setTimeout(() => {
      this.fetchSchedulableRecord();
      this.setFetchSchedulableRecordLoop();
    }, 3000);
  }

  public fetchSchedulableRecord(): void {
    const that = this;
    fetch(`${window.mountPath}/models/${this.props.model_name}.json?after=${this.state.timeRangeMinute}`)
      .then((res) => res.json())
      .then((data) => {
        that.setState(data);
      }).catch((err) => {
        console.error(err);
      });
  }

  public setFetchExecutionLoop(): void {
    this.executionFetchLoop = setTimeout(() => {
      this.fetchExecution();
      this.setFetchExecutionLoop();
    }, 3000);
  }

  public fetchExecution(): void {
    fetch(`${window.mountPath}/models/${this.props.model_name}/executions.json`)
      .then((res) => res.json())
      .then((data) => {
        this.setState({executions: data.records});
      }).catch((err) => {
        console.error(err);
      });
  }

  public render() {
    return (
      <div id="schedulable-models">
        <FormControl className="filter-form">
          <TextField
            id="time-range-input"
            label="Time Range"
            type="number"
            defaultValue={this.state.timeRangeMinute}
            helperText="minute after"
            margin="normal"
            onChange={this.wrappedHandleTimeRangeFilterChange}
          />
        </FormControl>
        <Paper className="models-container" style={{marginTop: "8px"}}>
          <Table className="models">
            <TableHead>
              <TableRow>
                <SchedulableRecordTableCell>Status</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>ID</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Cron</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Next Execute At</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Delay Sec</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Execute Lock</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Time To Unlock</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Last Executed At</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Locked By</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Last Error Time</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Retry Count</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Detail</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Ops</SchedulableRecordTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.records.map((record) => (
                <SchedulableRecord key={record.id} model_name={this.props.model_name} record={record} />
              ))}
            </TableBody>
          </Table>
        </Paper>

        <hr />

        <Typography variant="title" id="executions" style={{marginTop: "8px"}}>Executions</Typography>
        <Paper className="executions-container" style={{marginTop: "8px"}}>
          <Table className="executions">
            <TableHead>
              <TableRow>
                <SchedulableRecordTableCell>Status</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>ID</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>ScheduleID</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>ScheduleType</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>WorkerID</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Executed At</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Completed At</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Error Name</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Error Reason</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Detail</SchedulableRecordTableCell>
                <SchedulableRecordTableCell>Ops</SchedulableRecordTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.executions.map((execution) => (
                <Execution key={execution.id} execution={execution} />
              ))}
            </TableBody>
          </Table>
        </Paper>
      </div>
    )
  }

  private wrappedHandleTimeRangeFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    this.handleTimeRangeFilterChange(event);
  }
}

export default SchedulableRecords;
