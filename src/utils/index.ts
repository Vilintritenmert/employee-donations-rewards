import * as LineByLine from 'n-readlines';

export async function* readLineByLine(filePath) {
  const broadbandLines = new LineByLine(filePath);
  let line;
  while ((line = broadbandLines.next())) {
    yield line.toString();
  }
}

export const objectIsNotEmpty = (obj) => Object.keys(obj).length > 0;
